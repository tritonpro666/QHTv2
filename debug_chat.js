import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_CHAT_KEY);

async function debugChat() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
        
        const history = []; // Empty history for start
        const chat = model.startChat({ history });
        
        const SOFO_SYSTEM_PROMPT = `Eres "Sofo", asistente empático de un Liceo Técnico.`;
        const message = "Hola";
        const fullMessage = `INSTRUCCIONES DE SISTEMA:\n${SOFO_SYSTEM_PROMPT}\n\nMENSAJE DEL USUARIO: ${message}`;
        
        console.log("Enviando mensaje:", fullMessage);
        const result = await chat.sendMessage(fullMessage);
        console.log("Respuesta Exitosa:", result.response.text());
    } catch (e) {
        console.error("ERROR DETECTADO:", e.message);
        if (e.stack) console.error(e.stack);
    }
}

debugChat();
