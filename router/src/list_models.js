
import { GoogleGenAI } from '@google/genai';
import 'dotenv/config';

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

async function listModels() {
    try {
        // The SDK interface for listing models might vary, but let's try the common one.
        // If specific method isn't clear, we'll try to hit the REST endpoint or use a known method.
        // However, @google/genai is new (v0.1.1).
        // Let's try the HTTP request approach if SDK method is obscure, 
        // BUT the error message suggested: "Call ListModels to see the list..."

        // For @google/genai (the new one):
        const response = await ai.models.list();
        console.log("Available Models:");
        for await (const model of response) {
            console.log(`- ${model.name}`);
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
