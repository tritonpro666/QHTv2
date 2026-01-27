
import { GoogleGenerativeAI } from "@google/generative-ai";

const KEY = "AIzaSyCsdyuo4DRqvVHXfKuwoSG_WvOYsImd1iU";

async function test() {
    const genAI = new GoogleGenerativeAI(KEY);
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const res = await model.generateContent("test");
        console.log("SUCCESS:", res.response.text().substring(0, 10));
    } catch (e) {
        console.error("FAILURE:", e.message);
    }
}

test();
