import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding billing database...')

    const userId = '1'

    console.log(`Creating billing records for user ${userId}...`)

    // Order 1: Paid order with invoice
    await prisma.order.create({
        data: {
            userId,
            status: 'delivered',
            deliveryStatus: 'delivered',
            amount: 120.50,
            paymentStatus: 'paid',
            refundStatus: 'none',
            invoiceUrl: 'https://api.example.com/invoices/inv_12345.pdf',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10) // 10 days ago
        }
    })

    // Order 2: Refunded order
    await prisma.order.create({
        data: {
            userId,
            status: 'cancelled',
            deliveryStatus: 'pending',
            amount: 45.00,
            paymentStatus: 'paid',
            refundStatus: 'completed',
            invoiceUrl: 'https://api.example.com/invoices/inv_67890.pdf',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
        }
    })

    // Order 3: Pending payment
    await prisma.order.create({
        data: {
            userId,
            status: 'placed',
            deliveryStatus: 'pending',
            amount: 299.99,
            paymentStatus: 'pending',
            refundStatus: 'none',
            createdAt: new Date() // Just now
        }
    })

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
