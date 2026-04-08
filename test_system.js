import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_CHAT_KEY);

async function testSystemInstruction() {
    try {
        console.log("Probando gemma-3-27b-it con systemInstruction...");
        const model = genAI.getGenerativeModel({ 
            model: "gemma-3-27b-it",
            systemInstruction: "Eres un gato que solo dice miau."
        });
        const result = await model.generateContent("Hola");
        console.log("Respuesta:", result.response.text());
    } catch (e) {
        console.error("Error con systemInstruction:", e.message);
    }
}

testSystemInstruction();
