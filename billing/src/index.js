import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { PrismaClient } from '@prisma/client'
import 'dotenv/config'
import { getInvoiceDetails, checkRefundStatus } from './tools.js'

const app = new Hono()

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

    console.log(`[Billing] Received: "${message}" from User: ${userId}`)

    try {
        const prompt = `
      You are a Billing Support Agent.
      User ID: ${userId}
      
      Conversation History:
      ${history ? history.map(m => `${m.role}: ${m.content}`).join('\n') : "No history"}
      
      User: ${message}
      
      TOOLS AVAILABLE:
      - getInvoiceDetails(userId): Get recent invoices.
      - checkRefundStatus(userId): Get refund status.
      
      INSTRUCTIONS:
      - You must ALWAYS output valid JSON.
      - If you need data, output JSON: {"tool": "toolName", "args": { "userId": "${userId}" }}
      - If you have the answer or don't need tools, output JSON:
        { "steps": ["Step 1...", "Step 2..."], "reply": "Final answer" }
      - The "steps" array should be granular and technical (e.g., "Validating session...", "Querying billing database via Prisma...", "Calculating refunds...", "Generating response...").
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
                        console.log(`[Billing] Executing tool: ${data.tool}`)
                        let toolResult = ""

                        if (data.tool === 'getInvoiceDetails') {
                            toolResult = await getInvoiceDetails(userId)
                        } else if (data.tool === 'checkRefundStatus') {
                            toolResult = await checkRefundStatus(userId)
                        }

                        // Second turn
                        const finalPrompt = `
                  ${prompt}
                  
                  TOOL RESULT:
                  ${JSON.stringify(toolResult)}
                  
                  Generate a helpful natural language response based on this result.
                   Output JSON: { "steps": ["Reviewing records...", "Calculating totals..."], "reply": "Final answer" }
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
                console.log("[Billing] JSON Parse failed, using raw text:", e.message)
                reply = text
            }
            return c.json({ reply, steps })
        } catch (apiError) {
            console.error("OpenRouter API Error (Billing):", apiError);
            return c.json({ reply: "Billing is experiencing high traffic. Please wait a moment." });
        }

    } catch (error) {
        console.error("Billing Agent Error:", error)
        return c.json({ reply: "I'm sorry, I'm having trouble with billing systems right now." })
    }
})

export default app

app.get('/health', (c) => c.json({ status: 'ok', agent: 'billing' }))

const port = process.env.PORT || 4003
console.log(`Billing Agent running on port ${port}`)

serve({
    fetch: app.fetch,
    port: Number(port)
})
