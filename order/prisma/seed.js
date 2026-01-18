import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    const userIds = ['1', '2', '3', '4', '5']

    // Possible values for enums
    const orderStatuses = ['placed', 'confirmed', 'shipped', 'delivered', 'cancelled']
    const deliveryStatuses = ['pending', 'in_transit', 'delivered']
    const paymentStatuses = ['paid', 'pending', 'failed']

    for (const userId of userIds) {
        console.log(`Creating orders for user ${userId}...`)

        // Order 1: Recent, unrelated status
        await prisma.order.create({
            data: {
                userId,
                status: 'delivered',
                deliveryStatus: 'delivered',
                amount: Math.floor(Math.random() * 100) + 20,
                paymentStatus: 'paid',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
            }
        })

        // Order 2: Active or different status
        await prisma.order.create({
            data: {
                userId,
                status: 'shipped',
                deliveryStatus: 'in_transit',
                amount: Math.floor(Math.random() * 200) + 50,
                paymentStatus: 'paid',
                createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1) // 1 day ago
            }
        })
    }

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
