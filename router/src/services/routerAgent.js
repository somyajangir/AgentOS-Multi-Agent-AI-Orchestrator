import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini client (API key auto-read from env)
const ai = new GoogleGenAI({});

/**
 * Routes a user's query using Keyword Heuristics to save API calls.
 * (Gemini API is used as a fallback if needed, or disabled for speed).
 * @param {string} message
 * @returns {Promise<string>}
 */
export async function routeQuery(message) {
  const msg = message.toLowerCase();

  // Keyword Heuristics
  // Order Keywords
  if (msg.match(/order|track|delivery|status|shipping|package|arrived/)) {
    return 'order';
  }

  // Billing Keywords
  if (msg.match(/bill|invoice|refund|payment|charge|cost|price/)) {
    return 'billing';
  }

  // Default to support for everything else (or valid 'help', 'support' queries)
  return 'support';

  /* 
  // --- Legacy Gemini Routing (Disabled for Rate Limit Optimization) ---
  const prompt = `
  ...
  `;
  try {
    // const response = await ai.models.generateContent(...)
    // ...
  } catch (error) { ... }
  */
}