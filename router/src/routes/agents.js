import { Hono } from 'hono'

const agents = new Hono()

// GET /api/agents
agents.get('/', (c) => {
  return c.json({
    agents: [
      {
        id: 'support',
        name: 'Support Agent',
        description: 'General support, FAQs, troubleshooting',
        capabilities: ['History Query', 'FAQs']
      },
      {
        id: 'order',
        name: 'Order Agent',
        description: 'Track orders, status updates, cancellations',
        capabilities: ['Order Status', 'Delivery Tracking', 'Cancellations']
      },
      {
        id: 'billing',
        name: 'Billing Agent',
        description: 'Invoices, refunds, payment issues',
        capabilities: ['Invoice Details', 'Refund Status']
      }
    ]
  })
})

// GET /api/agents/:type/capabilities
agents.get('/:type/capabilities', (c) => {
  const type = c.req.param('type')

  const capabilities = {
    support: ['faq', 'troubleshooting'],
    order: ['order-status', 'tracking', 'cancellation'],
    billing: ['refunds', 'invoices', 'payments']
  }

  return c.json({
    agent: type,
    capabilities: capabilities[type] || []
  })
})

export default agents
