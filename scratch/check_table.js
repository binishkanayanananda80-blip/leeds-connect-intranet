const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma/leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  try {
    const count = await prisma.passwordResetToken.count()
    console.log('passwordResetToken count:', count)
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
