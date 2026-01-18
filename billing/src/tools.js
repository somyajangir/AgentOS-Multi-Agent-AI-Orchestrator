import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Gets invoice details for a user.
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const getInvoiceDetails = async (userId) => {
    if (!userId) return [];
    return await prisma.order.findMany({
        where: {
            userId,
            invoiceUrl: { not: null }
        },
        select: { id: true, invoiceUrl: true, amount: true },
        orderBy: { createdAt: 'desc' },
        take: 3
    });
}

/**
 * Checks refund status.
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const checkRefundStatus = async (userId) => {
    if (!userId) return [];
    return await prisma.order.findMany({
        where: {
            userId,
            refundStatus: { not: null }
        },
        select: { id: true, refundStatus: true, amount: true },
        orderBy: { createdAt: 'desc' },
        take: 3
    });
}
