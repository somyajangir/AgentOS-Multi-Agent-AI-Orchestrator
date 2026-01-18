import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Fetches order details for a user.
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const fetchOrderDetails = async (userId) => {
    if (!userId) return [];
    return await prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
}

/**
 * Checks delivery status for specific orders.
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const checkDeliveryStatus = async (userId) => {
    if (!userId) return [];
    return await prisma.order.findMany({
        where: { userId },
        select: { id: true, deliveryStatus: true, status: true },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
}
