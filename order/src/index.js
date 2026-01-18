import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { PrismaClient } from '@prisma/client'
import { fetchOrderDetails, checkDeliveryStatus } from './tools.js'
import 'dotenv/config'

const app = new Hono()
const prisma = new PrismaClient()

// OpenRouter Configuration
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const SITE_URL = 'http://localhost:3000' // Optional
const SITE_NAME = 'AI Support Agents' // Optional

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

    console.log(`[Order] Received: "${message}" from User: ${userId}`)

    try {
        const prompt = `
      You are an Order Support Agent.
      User ID: ${userId}
      
      Conversation History:
      ${history.slice(-3).map(m => `${m.role}: ${m.content}`).join('\n')}
      
      User: ${message}
      
      TOOLS AVAILABLE:
      - fetchOrderDetails(userId): Get recent orders.
      - checkDeliveryStatus(userId): Get delivery status.
      
      INSTRUCTIONS:
      - You must ALWAYS output valid JSON.
      - If you need data, output JSON: {"tool": "toolName", "args": { "userId": "${userId}" }}
      - If you have the answer or don't need tools, output JSON: 
        {
          "steps": ["Step 1...", "Step 2..."], 
          "reply": "Final answer"
        }
      - The "steps" array should be granular and technical (e.g., "Authenticating user...", "Connecting to Prisma DB...", "Fetching order #123...", "Processing data...").
    `

        try {
            const text = await callOpenRouter(prompt);
            let reply = text
            let steps = []

            // Attempt to parse JSON for tool call
            try {
                // Look for JSON object in the text
                const jsonStartIndex = text.indexOf('{');
                const jsonEndIndex = text.lastIndexOf('}');

                if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
                    const jsonStr = text.substring(jsonStartIndex, jsonEndIndex + 1);
                    const data = JSON.parse(jsonStr)

                    if (data.tool) {
                        console.log(`[Order] Executing tool: ${data.tool}`)
                        let toolResult = ""

                        if (data.tool === 'fetchOrderDetails') {
                            toolResult = await fetchOrderDetails(userId)
                        } else if (data.tool === 'checkDeliveryStatus') {
                            toolResult = await checkDeliveryStatus(userId)
                        }


                        // Delay to avoid Rate Limit (4s)
                        await new Promise(pkg => setTimeout(pkg, 4000));

                        // Second turn: Generate final answer with data
                        const finalPrompt = `
                  ${prompt}
                  
                  TOOL RESULT:
                  ${JSON.stringify(toolResult)}
                  
                  Generate a helpful natural language response based on this result.
                  Output JSON: { "steps": ["Analyzed tool result...", "Formulating response..."], "reply": "Final answer" }
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
                // Not JSON or failed to parse, assume direct text reply
                console.log("[Order] JSON Parse failed, using raw text:", e.message)
                reply = text
            }
            return c.json({ reply, steps })
        } catch (apiError) {
            console.error("OpenRouter API Error (Order):", apiError);
            return c.json({ reply: "I'm currently overloaded. Please try again in a moment." });
        }

    } catch (error) {
        console.error("Order Agent Error:", error)
        return c.json({ reply: "I'm sorry, I encountered an error checking your orders." })
    }
})

app.get('/health', (c) => c.json({ status: 'ok', agent: 'order' }))

const port = process.env.PORT || 4002
console.log(`Order Agent running on port ${port}`)

serve({
    fetch: app.fetch,
    port: Number(port)
})
