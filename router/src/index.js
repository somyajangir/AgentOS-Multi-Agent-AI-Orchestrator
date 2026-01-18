import { Hono } from 'hono'
import { serve } from '@hono/node-server'

import chatRouter from './routes/chat.js'
import agentRouter from './routes/agents.js'
import healthRouter from './routes/health.js'

import { cors } from 'hono/cors'

const app = new Hono()

app.use('/*', cors())

// routes
app.route('/api/chat', chatRouter)
app.route('/api/agents', agentRouter)
app.route('/api/health', healthRouter)

// start server (Node.js)
serve({
  fetch: app.fetch,
  port: 4000,
})

console.log('🚀 Server running on http://localhost:4000')
