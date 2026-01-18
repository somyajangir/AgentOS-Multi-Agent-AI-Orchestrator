import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { PrismaClient } from '@prisma/client'
import { queryConversationHistory } from './tools.js'
import 'dotenv/config'

const app = new Hono()
const prisma = new PrismaClient()

// OpenRouter Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const SITE_URL = 'http://localhost:3000'
const SITE_NAME = 'AI Support Agents'

async function callOpenRouter(prompt) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "HTTP-Referer": SITE_URL,
            "X-Title": SITE_NAME,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "model": "google/gemini-2.0-flash-001",
            "messages": [
                { "role": "user", "content": prompt }
            ]
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter API Error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

app.post('/', async (c) => {
    const { message, userId, history } = await c.req.json()
    console.log(`[Support] Received: "${message}" from User: ${userId}`)

    try {
        const prompt = `
      You are a Friendly Support Agent.
      User ID: ${userId}
      
      Conversation History:
      ${history ? history.map(m => `${m.role}: ${m.content}`).join('\n') : "No history"}
      
      User: ${message}
      
      TOOLS AVAILABLE:
      - queryConversationHistory(userId): Check previous topics user asked about.
      
      INSTRUCTIONS:
      - Start by explicitly acknowledging the user's request for help in a friendly manner.
      - You must ALWAYS output valid JSON.
      - If user asks about what they said before, use the tool. JSON: {"tool": "queryConversationHistory", "args": { "userId": "${userId}" }}
      - Otherwise, answer their general questions or FAQ.
        Output JSON: { "steps": ["Checking knowledge base...", "Formulating helpful response..."], "reply": "Final answer" }
      - Steps should be granular (e.g., "Connecting to database...", "Querying history...", "Analyzing sentiment...").
      - Be polite and empathetic.
    `

        try {
            const text = await callOpenRouter(prompt);
            let reply = text
            let steps = []

            try {
                // Look for JSON object in the text
                const jsonStartIndex = text.indexOf('{');
                const jsonEndIndex = text.lastIndexOf('}');

                if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                    const jsonStr = text.substring(jsonStartIndex, jsonEndIndex + 1);
                    const data = JSON.parse(jsonStr)

                    if (data.tool) {
                        console.log(`[Support] Executing tool: ${data.tool}`)
                        let toolResult = ""

                        if (data.tool === 'queryConversationHistory') {
                            toolResult = await queryConversationHistory(userId)
                        }

                        const finalPrompt = `
                  ${prompt}
                  
                  TOOL RESULT:
                  ${JSON.stringify(toolResult)}
                  
                  Generate a helpful natural language response based on this result.
                  Output JSON: { "steps": ["Analyzing history...", "Formulating helpful response..."], "reply": "Final answer" }
                `
                        const finalText = await callOpenRouter(finalPrompt);

                        try {
                            const finalJsonStart = finalText.indexOf('{');
                            const finalJsonEnd = finalText.lastIndexOf('}');
                            if (finalJsonStart !== -1) {
                                const finalData = JSON.parse(finalText.substring(finalJsonStart, finalJsonEnd + 1));
                                reply = finalData.reply || finalText;
                                steps = finalData.steps || [];
                            } else {
                                reply = finalText;
                            }
                        } catch (e) {
                            reply = finalText;
                        }

                    } else if (data.reply) {
                        reply = data.reply
                        steps = data.steps || []
                    }
                }
            } catch (e) {
                console.log("[Support] JSON Parse failed, using raw text:", e.message)
                reply = text
            }
            return c.json({ reply, steps })
        } catch (apiError) {
            console.error("OpenRouter API Error:", apiError);
            return c.json({ reply: "I'm overloaded right now. Please try again in 10 seconds." });
        }

    } catch (error) {
        console.error("Support Agent Error:", error)
        return c.json({ reply: "I'm having trouble connecting to support database." })
    }
})

export default app

app.get('/health', (c) => c.json({ status: 'ok', agent: 'support' }))

const port = process.env.PORT || 4001
serve({
    fetch: app.fetch,
    port: Number(port)
})
