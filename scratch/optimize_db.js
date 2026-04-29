
const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('Optimizing SQLite for multi-browser testing...')
  
  // Enable WAL mode
  await prisma.$executeRawUnsafe('PRAGMA journal_mode=WAL;')
  
  // Extra optimizations
  await prisma.$executeRawUnsafe('PRAGMA synchronous=NORMAL;')
  await prisma.$executeRawUnsafe('PRAGMA cache_size=10000;')
  
  const result = await prisma.$queryRawUnsafe('PRAGMA journal_mode;')
  console.log('Current Mode:', result)
  
  console.log('Database optimization complete! Concurrency is now enabled.')
}

main()
  .catch(e => console.error(e))
  .finally(() => process.exit())
