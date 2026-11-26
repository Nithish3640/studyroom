import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODELS = [process.env.GEMINI_MODEL, "gemini-3.5-flash"].filter(Boolean);

export async function askGemini(prompt) {
    for (const model of MODELS) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });
            return response.text;
        } catch (err) {
            console.log("Gemini failed with", model, "->", err.status || err.message);
        }
    }
    throw new Error("AI is busy right now");
}