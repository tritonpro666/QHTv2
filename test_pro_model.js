import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

async function listModels() {
    try {
        // There is no easy 'listModels' in the simple SDK, but we can try a different endpoint or model
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const result = await model.generateContent("test");
        console.log("Gemini Pro responde:", result.response.text());
    } catch (error) {
        console.error("Error con Gemini Pro:", error.message);
    }
}

listModels();
