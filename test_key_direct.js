import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_CHAT_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

async function test() {
    const key = process.env.VITE_GEMINI_CHAT_KEY;
    console.log("Probando llave (CHAT):", key ? key.substring(0, 8) + "..." : "MISSING");
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hola, responde con la palabra 'FUNCIONA'");
        console.log("Respuesta:", result.response.text());
    } catch (error) {
        console.error("Error directo:", error);
    }
}

test();
