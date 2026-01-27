import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);

const modelsToTest = [
    "gemini-2.0-flash",
    "gemini-1.5-flash"
];

async function runTests() {
    for (const modelName of modelsToTest) {
        console.log(`Testing ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Say OK");
            console.log(`RESULT:${modelName}:SUCCESS:${result.response.text()}`);
        } catch (error) {
            console.log(`RESULT:${modelName}:ERROR:${error.message}`);
        }
        console.log("Waiting 10 seconds...");
        await new Promise(r => setTimeout(r, 10000));
    }
}

runTests();
