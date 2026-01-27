import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

const modelsToTest = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest"
];

async function runTests() {
    console.log("Testing with Key:", process.env.VITE_GEMINI_API_KEY.substring(0, 8) + "...");
    for (const modelName of modelsToTest) {
        console.log(`\n--- Testing ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hola, di 'OK'");
            console.log(`[${modelName}] SUCCESS:`, result.response.text());
        } catch (error) {
            console.log(`[${modelName}] ERROR:`, error.message.substring(0, 100));
        }
    }
}

runTests();
