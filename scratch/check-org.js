const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('--- BRANCHES ---')
  const branches = await prisma.branch.findMany({ select: { id: true, name: true } })
  console.log(JSON.stringify(branches, null, 2))

  console.log('\n--- DEPARTMENTS ---')
  const depts = await prisma.department.findMany({ select: { id: true, name: true } })
  console.log(JSON.stringify(depts, null, 2))

  await prisma.$disconnect()
}

main().catch(err => { console.error(err); process.exit(1); })
