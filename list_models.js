import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_CHAT_KEY);

async function listModels() {
    try {
        // Unfortunately GoogleGenerativeAI doesn't have a listModels method in some versions
        // but it's part of the standard API.
        console.log("Intentando probar gemma-3-27b-it directamente...");
        const model = genAI.getGenerativeModel({ model: "gemma-3-27b-it" });
        const result = await model.generateContent("Hola");
        console.log("Éxito con gemma-3-27b-it:", result.response.text());
    } catch (e) {
        console.error("Error con gemma-3-27b-it:", e.message);
        console.log("\nProbando con gemini-1.5-flash (control)...");
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Hola");
            console.log("Éxito con gemini-1.5-flash:", result.response.text());
        } catch (e2) {
            console.error("Error con gemini-1.5-flash (LLAVE INVÁLIDA?):", e2.message);
        }
    }
}

listModels();
