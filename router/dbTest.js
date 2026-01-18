import { prisma } from './prisma/client.js'

async function main() {
  const convo = await prisma.conversation.create({ data: {} })
  console.log('Conversation created:', convo)

  await prisma.$disconnect()
}

main()
