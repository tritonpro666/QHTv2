
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();
const KEY = process.env.VITE_GEMINI_API_KEY;

async function test() {
    console.log("--- Testing NEW Key: " + KEY + " ---");
    const genAI = new GoogleGenerativeAI(KEY);

    // Test multiple identifiers because some keys only like some names
    const models = ["gemini-1.5-flash", "gemini-flash-latest", "gemini-2.0-flash"];

    for (const m of models) {
        console.log(`\nTesting ${m}...`);
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const res = await model.generateContent("test");
            console.log(`[${m}] SUCCESS:`, res.response.text().substring(0, 20));
            return; // Exit if one works
        } catch (e) {
            console.error(`[${m}] FAILURE:`, e.message);
        }
    }
}

test();
