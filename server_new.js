import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Configuración de Simulación
const SIMULATION_MODE = process.env.SIMULATION_MODE === 'true';

app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Middleware de monitoreo de peticiones para detectar redundancia
app.use((req, res, next) => {
    const start = Date.now();
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    console.log(`[REQUEST] ${new Date().toLocaleTimeString()} | ${req.method} ${req.url} | From: ${ip}`);

    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[RESPONSE] ${req.url} | Status: ${res.statusCode} | Duration: ${duration}ms`);
    });
    next();
});

// Memoria Caché Simple para evitar peticiones redundantes
const apiCache = new Map();
const CACHE_TTL = 5000; // 5 segundos de gracia para peticiones idénticas

function getCacheKey(data) {
    return JSON.stringify(data);
}

function getFromCache(key) {
    const cached = apiCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }
    return null;
}

function saveToCache(key, data) {
    apiCache.set(key, { data, timestamp: Date.now() });
    // Limpieza automática simple
    setTimeout(() => apiCache.delete(key), CACHE_TTL);
}

const chatKey = process.env.VITE_GEMINI_CHAT_KEY;
const gameKey = process.env.VITE_GEMINI_GAME_KEY;

console.log(`[INIT] Chat Key Length: ${chatKey?.length || 0}`);
if (chatKey) console.log(`[INIT] Chat Key starts with: ${chatKey.substring(0, 4)}...`);

let genAIChat = new GoogleGenerativeAI(chatKey);
let genAIGame = new GoogleGenerativeAI(gameKey);

app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        simulation: SIMULATION_MODE,
        chatKeyOk: !!process.env.VITE_GEMINI_CHAT_KEY,
        gameKeyOk: !!process.env.VITE_GEMINI_GAME_KEY
    });
});

app.get('/api/settings/config', (req, res) => {
    res.json({
        chatKey: process.env.VITE_GEMINI_CHAT_KEY || "",
        gameKey: process.env.VITE_GEMINI_GAME_KEY || ""
    });
});

app.post('/api/settings/config', (req, res) => {
    const { chatKey, gameKey } = req.body;

    if (chatKey) {
        process.env.VITE_GEMINI_CHAT_KEY = chatKey;
        genAIChat = new GoogleGenerativeAI(chatKey);
        chatModel = genAIChat.getGenerativeModel({
            model: "gemma-3-27b-it"
        });
        console.log(`[CONFIG] Chat Key actualizada`);
    }

    if (gameKey) {
        process.env.VITE_GEMINI_GAME_KEY = gameKey;
        genAIGame = new GoogleGenerativeAI(gameKey);
        gameModel = genAIGame.getGenerativeModel({
            model: "gemma-3-27b-it"
        });
        console.log(`[CONFIG] Game Key actualizada`);
    }

    res.json({ success: true, message: "Configuración actualizada" });
});

app.post('/api/evaluate', async (req, res) => {
    const { scenario, plays } = req.body;
    const timestamp = new Date().toLocaleTimeString();

    if (!scenario || !plays) return res.status(400).json({ error: "Datos insuficientes" });

    console.log(`[${timestamp}] Evaluando caso: ${scenario.title}`);

    const cacheKey = getCacheKey({ scenario, plays });
    const cachedResponse = getFromCache(cacheKey);
    if (cachedResponse) {
        console.log(`[${timestamp}] Sirviendo evaluación desde caché.`);
        return res.json(cachedResponse);
    }

    try {
        const prompt = `Actúa como Sofo, el juez experto en convivencia escolar y el RICE.
        CASO: "${scenario.title}: ${scenario.desc}"
        SOLUCIONES PROPUESTAS:
        ${plays.map(p => `- Jugador ${p.name} (Rol: ${p.role}): "${p.cardTitle}: ${p.cardDesc}"`).join('\n')}

        CRITERIOS DE EVALUACIÓN:
        1. Empatía y respeto por los involucrados.
        2. Apego a la resolución pacífica de conflictos (Justicia Restaurativa).
        3. Creatividad y uso del rol del personaje.
        4. Seguridad de la comunidad escolar.

        Responde estrictamente en formato JSON válido:
        {
          "ranking": [ {"playerId": ID, "score": PUNTAJE_0_10, "feedback": "BREVE_EXPLICACION_PEDAGOGICA"} ],
          "winnerId": ID_DEL_GANADOR,
          "sofoComment": "COMENTARIO_FINAL_ALENTADOR_Y_CERCANO"
        }`;

        const result = await gameModel.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{.*\}/s);
        if (jsonMatch) {
            const finalData = JSON.parse(jsonMatch[0]);
            saveToCache(cacheKey, finalData);
            res.json(finalData);
        } else {
            throw new Error("Respuesta de IA no tiene formato JSON válido");
        }
    } catch (error) {
        console.error(`[${timestamp}] Error evaluando:`, error);
        res.json({
            ranking: plays.map((p, i) => ({ playerId: p.playerId, score: 5, feedback: "No pude evaluar con precisión en este momento, pero tu esfuerzo cuenta mucho." })),
            winnerId: plays[0].playerId,
            sofoComment: "Mis circuitos de evaluación están algo lentos hoy, ¡pero todas las soluciones son valiosas para aprender!",
            isSimulated: true,
            errorHint: error.message.substring(0, 50)
        });
    }
});

const SOFO_SYSTEM_PROMPT = `Eres "Sofo", asistente empático de un Liceo Técnico.
CONOCIMIENTO BASE: 
- El Liceo ofrece especialidades como: Electricidad, Gastronomía, Administración, Programación, Mecánica, Construcción y Enfermería (TENS).
- Ayudas a adolescentes con orientación vocacional (especialidades), apoyo emocional y convivencia escolar.
- Tu tono es cercano, juvenil pero respetuoso ("profe buena onda").
- Si te preguntan por una especialidad, destaca sus ventajas laborales.

SEGURIDAD CRÍTICA: Si detectas ideación suicida, violencia grave (armas, amenazas), acoso sexual o delitos, responde UNICAMENTE con un JSON:
{"isCritical":true, "category":"TIPO", "reason":"...", "response":"Respuesta de contención y sugerencia de ayuda profesional"}.
Si no hay peligro, responde normal, breve y cercano.`;

let chatModel = genAIChat.getGenerativeModel({
    model: "gemma-3-27b-it"
});

let gameModel = genAIGame.getGenerativeModel({
    model: "gemma-3-27b-it"
});

// Respuestas simuladas para cuando la API falla o está bloqueada por IP
const MOCK_RESPONSES = [
    "¡Hola! Entiendo lo que dices. Como soy un asistente en fase de pruebas, a veces mis circuitos se cansan, pero aquí estoy para escucharte. ¿En qué especialidad estás pensando?",
    "Eso suena muy interesante. En el Liceo tenemos grandes herramientas para ayudarte a cumplir tus metas. ¿Has hablado con tus profes sobre esto?",
    "Te escucho. Recuerda que siempre es bueno compartir cómo nos sentimos con alguien de confianza. ¿Cómo te has sentido esta semana?",
    "¡Qué buena pregunta! El mundo técnico tiene muchas oportunidades hoy en día. ¿Te gusta más la parte práctica o la teoría?",
    "Comprendo. A veces las cosas en el liceo pueden ser desafiantes, pero no estás solo. Sofo está aquí para orientarte."
];

app.post('/api/chat', async (req, res) => {
    const { message, context, history } = req.body;
    const timestamp = new Date().toLocaleTimeString();

    if (!message) return res.status(400).json({ error: "Mensaje requerido" });

    // Si estamos en modo simulación manual
    if (SIMULATION_MODE) {
        console.log(`[${timestamp}] MODO SIMULACIÓN ACTIVO`);
        const mockRes = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
        return res.json({ isCritical: false, response: `[SIMULADO] ${mockRes}` });
    }

    const cacheKey = getCacheKey({ message, history, context });
    const cachedResponse = getFromCache(cacheKey);
    if (cachedResponse) {
        console.log(`[${timestamp}] Sirviendo chat desde caché.`);
        return res.json(cachedResponse);
    }

    try {
        const contextStr = context ? `\n[Estudiante: ${context.name}]` : "";
        // Prepend system prompt for Gemma as it doesn't support systemInstruction
        const fullMessage = `INSTRUCCIONES DE SISTEMA:\n${SOFO_SYSTEM_PROMPT}\n\nMENSAJE DEL USUARIO: ${message} ${contextStr}`;

        // Preparar historial para Gemini
        const formattedHistory = (history || []).map(h => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.text }]
        }));

        const chat = chatModel.startChat({
            history: formattedHistory,
        });

        const result = await chat.sendMessage(fullMessage);
        const responseText = result.response.text();

        let parsedResponse;
        try {
            // Check if response looks like JSON (for safety triggers)
            const trimmed = responseText.trim();
            if ((trimmed.startsWith('{') || trimmed.includes('"isCritical":true')) && trimmed.includes('}')) {
                const cleanJson = responseText.replace(/```json|```/g, '').trim();
                const jsonMatch = cleanJson.match(/\{.*\}/s);
                if (jsonMatch) {
                    parsedResponse = JSON.parse(jsonMatch[0]);
                } else {
                    parsedResponse = { isCritical: false, response: responseText };
                }
            } else {
                parsedResponse = { isCritical: false, response: responseText };
            }
        } catch (e) {
            parsedResponse = { isCritical: false, response: responseText };
        }

        saveToCache(cacheKey, parsedResponse);
        res.json(parsedResponse);
    } catch (error) {
        console.error(`[${timestamp}] ERROR CRÍTICO EN CHAT:`, error);

        // EMERGENCIA: Si la IA falla, al menos revisamos palabras clave de seguridad críticas
        const lowerMsg = message.toLowerCase();
        const safetyKeywords = ['arma', 'pistola', 'matar', 'morir', 'suicidio', 'bomba', 'pegar', 'acoso', 'abuso', 'violación'];
        const isSuspicious = safetyKeywords.some(word => lowerMsg.includes(word));

        if (isSuspicious) {
            return res.json({
                isCritical: true,
                category: "SEGURIDAD_EMERGENCIA",
                response: "He detectado palabras que me preocupan mucho. Si estás en peligro o sabes de alguien que lo esté, por favor habla de inmediato con un profesor, el director o llama a emergencias. Tu seguridad es lo más importante."
            });
        }

        // FALLBACK UNIVERSAL: No devolvemos 500, devolvemos una respuesta simulada
        console.warn(`[${timestamp}] Enviando respuesta de fallback por error: ${error.message}`);
        const mockRes = MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
        return res.json({
            isCritical: false,
            isSimulated: true,
            error: error.message,
            response: `(Sofo está procesando mucha información ahora, pero dice:) ${mockRes}`
        });
    }
});

app.listen(port, () => {
    console.log(`[VER 2.0] Servidor de Sofo AI con Gemma 3 en http://localhost:${port}`);
});
