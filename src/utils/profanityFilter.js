// src/utils/profanityFilter.js

// Lista de palabras no permitidas (incluyendo variaciones y jergas chilenas graves)
const BLOCKED_WORDS = [
    "suicidio", "matar", "muerte", "asesinato", "violacion", "violación",
    "puta", "puto", "maricón", "maricon", "weon", "weona", "aweonao", "aweona",
    "culiao", "culia", "conchetumare", "ctm", "perra", "zorra", "mierda", "cagar",
    "maraca", "maraco", "pico", "chota", "verga", "pija", "chucha", "conchetumadre",
    "pendejo", "pendeja", "weón", "wea", "weá"
];

// Función simple para escapar caracteres especiales en regex
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function containsProfanity(text) {
    if (!text) return false;
    
    // Normalizar texto para la búsqueda
    const normalizedText = text.toLowerCase()
        // Cambiar tildes comunes
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        // Reemplazar números que parecen letras comunes en leet speak
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/@/g, 'a');

    return BLOCKED_WORDS.some(word => {
        // Normalizar la palabra bloqueada también por si acaso
        const normalizedWord = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        // Queremos buscar coincidencias parciales si son claras (ej: "soyaweonaoxdlmao"),
        // pero usar \b para palabras más cortas quizás sea mejor a futuro.
        // Por ahora, simplemente si contiene la secuencia de caracteres tal cual, lo bloqueamos.
        return normalizedText.includes(normalizedWord);
    });
}
