import { Hono } from 'hono'
import { routeQuery } from '../services/routerAgent.js'
import { PrismaClient } from '@prisma/client'
import { TokenBucket } from '../utils/TokenBucket.js'
import 'dotenv/config'

const prisma = new PrismaClient()

const chat = new Hono()

// Global Rate Limiter
// Capacity: 2 (Burst size)
// Refill Rate: 0.1 tokens/sec (1 token every 10 seconds) -> ~6 requests/min
// Since 1 request ~ 3 API calls, 6 req/min ~ 18 API calls (close to 15 RPM limit)
const rateLimiter = new TokenBucket(2, 0.1);

// Helper: Wait for token with timeout
async function waitForToken(timeoutMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (rateLimiter.tryConsume()) return true;
    await new Promise(r => setTimeout(r, 1000)); // Check every second
  }
  return false;
}


// Map agent → URL (from env)
const AGENT_URLS = {
  support: process.env.SUPPORT_AGENT_URL,
  order: process.env.ORDER_AGENT_URL,
  billing: process.env.BILLING_AGENT_URL
}

chat.post('/messages', async (c) => {
  // apply rate limiting
  const hasToken = await waitForToken(15000); // Wait up to 15s
  if (!hasToken) {
    return c.json({
      error: 'System is busy (Rate Limit). Please try again in 10 seconds.',
      reply: "I'm overloaded with requests. Please give me a moment to cool down."
    }, 429);
  }

  let { message, conversationId, userId } = await c.req.json()

  // 1️⃣ Create or get conversation
  if (!conversationId) {
    const conversation = await prisma.conversation.create({
      data: { userId: userId || 'default-user' }
    })
    conversationId = conversation.id
  }

  // 2️⃣ Save User Message to DB
  await prisma.message.create({
    data: {
      conversationId,
      role: 'user',
      content: message
    }
  })

  // 3️⃣ Fetch History (last 10 messages) for Context
  const history = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 10
  })

  // Format history for agents (simple list of objects)
  const historyContext = history.map(m => ({
    role: m.role,
    content: m.content
  }))

  // 4️⃣ Decide agent
  const agent = await routeQuery(message)
  console.log('Selected Agent:', agent)

  const agentUrl = AGENT_URLS[agent]

  if (!agentUrl) {
    throw new Error(`No URL configured for agent: ${agent}`)
  }

  // Define initial steps from the Router level
  const routerSteps = [
    "Receiving request...",
    "Analyzing intent and context...",
    `Routing to ${agent.charAt(0).toUpperCase() + agent.slice(1)} Agent...`
  ]

  // 5️⃣ Forward request to agent server
  const response = await fetch(agentUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationId,
      userId,
      history: historyContext // Pass history
    })
  })

  if (!response.ok) {
    const errText = await response.text()
    throw new Error(
      `Agent ${agent} failed (${response.status}): ${errText}`
    )
  }

  const agentResponse = await response.json()
  const replyContent = agentResponse.reply || "No response content"
  const agentSteps = agentResponse.steps || []

  // Combine router steps with agent steps
  const combinedSteps = [...routerSteps, ...agentSteps]

  // 6️⃣ Save Agent Response to DB
  // Ensure 'agent' matches one of the Role enum values (support, order, billing)
  await prisma.message.create({
    data: {
      conversationId,
      role: agent,
      content: replyContent
    }
  })

  // 7️⃣ Return combined response to client
  return c.json({
    conversationId,
    routedTo: agent,
    agentResponse: { ...agentResponse, reply: replyContent, steps: combinedSteps }
  })
})

// GET /api/chat/conversations/:id
chat.get('/conversations/:id', async (c) => {
  const id = c.req.param('id')

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      }
    }
  })

  if (!conversation) {
    return c.json({ error: 'Conversation not found' }, 404)
  }

  return c.json({
    conversationId: conversation.id,
    userId: conversation.userId,
    messages: conversation.messages
  })
})

// GET /api/chat/conversations
chat.get('/conversations', async (c) => {
  const userId = c.req.query('userId')

  const where = userId ? { userId } : {}

  const conversations = await prisma.conversation.findMany({
    where,
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' }
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  // Format for frontend
  const formatted = conversations.map(conv => ({
    id: conv.id,
    userId: conv.userId,
    updatedAt: conv.updatedAt,
    lastMessage: conv.messages[0]?.content || "No messages"
  }))

  return c.json({ conversations: formatted })
})

// DELETE /api/chat/conversations/:id
chat.delete('/conversations/:id', async (c) => {
  const id = c.req.param('id')

  try {
    await prisma.conversation.delete({
      where: { id }
    })
    return c.json({ deleted: id, success: true })
  } catch (error) {
    return c.json({ error: 'Failed to delete conversation' }, 500)
  }
})

export default chat
