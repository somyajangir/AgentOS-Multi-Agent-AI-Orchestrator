import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Clean up
    await prisma.message.deleteMany()
    await prisma.conversation.deleteMany()
    await prisma.order.deleteMany()

    // 1. Create a dummy user conversation
    const convo = await prisma.conversation.create({
        data: {
            userId: 'user_123',
            messages: {
                create: [
                    { role: 'user', content: 'Hi, I have a problem.' },
                    { role: 'support', content: 'How can I help you today?' }
                ]
            }
        }
    })

    // 2. Create some Orders
    const order1 = await prisma.order.create({
        data: {
            userId: 'user_123',
            status: 'delivered',
            deliveryStatus: 'delivered',
            amount: 120.50,
            paymentStatus: 'paid',
            invoiceUrl: 'https://example.com/invoice/1'
        }
    })

    const order2 = await prisma.order.create({
        data: {
            userId: 'user_123',
            status: 'shipped',
            deliveryStatus: 'in_transit',
            amount: 45.00,
            paymentStatus: 'paid',
            invoiceUrl: 'https://example.com/invoice/2'
        }
    })

    const order3 = await prisma.order.create({
        data: {
            userId: 'user_123',
            status: 'cancelled',
            amount: 200.00,
            paymentStatus: 'paid',
            refundStatus: 'completed'
        }
    })

    console.log(`✅ Seeded:
  - Conversation: ${convo.id}
  - Orders: ${order1.id}, ${order2.id}, ${order3.id}
  `)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
