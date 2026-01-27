import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

const modelsToTest = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-1.5-pro"
];

async function runTests() {
    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            await model.generateContent("test");
            console.log(`RESULT:${modelName}:SUCCESS`);
        } catch (error) {
            if (error.message.includes("429")) {
                console.log(`RESULT:${modelName}:429`);
            } else if (error.message.includes("404") || error.message.includes("not found")) {
                console.log(`RESULT:${modelName}:404`);
            } else {
                console.log(`RESULT:${modelName}:ERROR:${error.message.substring(0, 50)}`);
            }
        }
    }
}

runTests();
