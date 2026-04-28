const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const adapter = new PrismaBetterSqlite3({ url: `file:${path.join(process.cwd(), 'prisma/leeds_v2.db')}` })
  const prisma = new PrismaClient({ adapter })

  try {
    // Test that all new fields/tables exist
    const reactionCount = await prisma.messageReaction.count()
    console.log('messageReaction table OK, count:', reactionCount)
    
    // Test sending a message (find first group)
    const group = await prisma.chatGroup.findFirst()
    if (group) {
      console.log('Found group:', group.id, group.name)
      const msgCount = await prisma.message.count({ where: { groupId: group.id } })
      console.log('Message count:', msgCount)
    }

    // Check message model has new fields
    const msg = await prisma.message.findFirst({ 
      include: { reactions: true, replyTo: true }
    })
    console.log('Message with reactions/replyTo OK:', msg ? 'found' : 'none yet')

  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}
main()
