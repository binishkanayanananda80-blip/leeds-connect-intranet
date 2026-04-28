const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('--- INSPECTING AUDIT ADMIN ---')
  const user = await prisma.user.findFirst({
    where: { email: 'audit-admin@leeds.lk' },
    include: { 
        role: { 
            include: { permissionLevel: true } 
        }
    }
  })
  
  if (user) {
    console.log('SUCCESS! User provisioned via Governance Engine:')
    console.log(`Email: ${user.email}`)
    console.log(`Role: ${user.role?.name}`)
    console.log(`Tier Rank: ${user.role?.permissionLevel?.rank}`)
    console.log(`Active Modules: ${user.activeModules}`)
  } else {
    console.log('AUDIT ADMIN NOT FOUND.')
  }

  await prisma.$disconnect()
}

main()
