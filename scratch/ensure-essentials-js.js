const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('--- FINAL STRUCTURAL SEED ---')

  // 1. Organization leeds
  const org = await prisma.organization.upsert({
    where: { id: 'leeds' },
    update: {},
    create: {
      id: 'leeds',
      name: 'Leeds International School',
      slug: 'leeds',
      isActive: true
    }
  })
  console.log('✓ Organization:', org.id)

  // 2. Branch NETWORK
  const branch = await prisma.branch.upsert({
    where: { id: 'NETWORK' },
    update: {},
    create: {
      id: 'NETWORK',
      name: 'Network-wide',
      organizationId: 'leeds',
      status: 'ACTIVE'
    }
  })
  console.log('✓ Branch:', branch.id)

  // 3. Departments
  const depts = [
    { id: 'acad-ops', name: 'Academic Operations' },
    { id: 'finance', name: 'Finance & Accounts' },
    { id: 'it', name: 'Information Technology' }
  ]

  for (const d of depts) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        name: d.name,
        organizationId: 'leeds',
      }
    })
    console.log(`✓ Department: ${d.name}`)
  }

  console.log('--- STABILIZATION COMPLETE ---')
  await prisma.$disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
