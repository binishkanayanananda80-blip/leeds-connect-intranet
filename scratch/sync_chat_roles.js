
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const rawUrl = process.env.DATABASE_URL ?? 'file:./prisma/leeds_v2.db'
const rawPath = rawUrl.replace('file:', '')
const dbPath = path.isAbsolute(rawPath) ? rawPath : path.join(process.cwd(), rawPath)
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  const groups = await prisma.chatGroup.findMany({
    where: { type: 'GROUP' }
  })
  
  console.log(`Syncing roles for ${groups.length} groups...`)
  
  for (const group of groups) {
    if (group.adminId) {
      const result = await prisma.groupMember.updateMany({
        where: {
          groupId: group.id,
          userId: group.adminId
        },
        data: {
          role: 'OWNER'
        }
      })
      console.log(`Updated ${group.name || group.id}: ${result.count} member(s) set to OWNER`)
    }
  }
  
  console.log('Roles synced successfully.')
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect())
