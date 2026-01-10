
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = "AIzaSyClhkLq2gGS1dFHraaoSKZPt2pfwqmHQ1g";
const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // Actually listModels is a method on the class or response?
        // SDK 0.24.0+ might not expose listModels directly on the main instance easily without using the model manager or generic request.
        // Wait, genAI.getGenerativeModel is for getting a model.
        // There isn't a simple listModels in the high level GoogleGenerativeAI class in earlier versions, but let's check.
        // Actually, usually it's not exposed in the simple client.

        console.log("Testing gemini-2.5-flash-preview-09-2025...");
        try {
            const model25 = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-09-2025" });
            const result25 = await model25.generateContent("Hello 2.5");
            console.log("SUCCESS: gemini-2.5 works!", result25.response.text());
            return;
        } catch (e) {
            console.log("gemini-2.5 failed:", e.message);
        }

        console.log("Testing gemini-1.5-pro...");
        try {
            const modelPro = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
            const resultPro = await modelPro.generateContent("Hello Pro");
            console.log("SUCCESS: gemini-1.5-pro works!", resultPro.response.text());
        } catch (e) {
            console.log("gemini-1.5-pro failed:", e.message);
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
