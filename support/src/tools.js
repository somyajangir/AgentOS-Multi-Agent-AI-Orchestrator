import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Queries conversation history for a user.
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
export const queryConversationHistory = async (userId) => {
    if (!userId) return [];
    // Fetch last 5 messages from all conversations of this user
    return await prisma.message.findMany({
        where: {
            conversation: {
                userId: userId
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
    });
}
