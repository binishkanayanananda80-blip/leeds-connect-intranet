import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('--- ENSURING ESSENTIAL RECORDS ---')

  // 1. Organization
  const org = await prisma.organization.upsert({
    where: { id: 'leeds' },
    update: {},
    create: {
      id: 'leeds',
      name: 'Leeds International School',
      shortName: 'LIS',
      type: 'SCHOOL',
      status: 'ACTIVE'
    }
  })
  console.log('✓ Organization:', org.id)

  // 2. Branch: NETWORK (Crucial for the UI default)
  const branch = await prisma.branch.upsert({
    where: { id: 'NETWORK' },
    update: {},
    create: {
      id: 'NETWORK',
      name: 'Network-wide',
      code: 'NET',
      organizationId: 'leeds',
      status: 'ACTIVE'
    }
  })
  console.log('✓ Branch:', branch.id)

  // 3. Ensure some essential departments exist if missing
  const defaultDepts = [
    { id: 'acad-ops', name: 'Academic Operations' },
    { id: 'finance', name: 'Finance & Accounts' },
    { id: 'it', name: 'Information Technology' }
  ]

  for (const d of defaultDepts) {
    await prisma.department.upsert({
      where: { id: d.id },
      update: {},
      create: {
        id: d.id,
        name: d.name,
        organizationId: 'leeds',
        branchId: 'NETWORK'
      }
    })
    console.log(`✓ Department: ${d.name}`)
  }

  console.log('--- DONE ---')
  await prisma.$disconnect()
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
