const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Initializing Sovereign Network Expansion...')

  // 1. Get Organization ID
  const org = await prisma.organization.findFirst({ select: { id: true } })
  if (!org) throw new Error('Organization not found')

  // 2. Clear existing branches to avoid collision
  await prisma.branch.deleteMany()
  console.log('🧹 Cleared existing branch registry.')

  // 3. SECURE THE ROOT: Panadura HQ
  const hq = await prisma.branch.create({
    data: {
      name: 'Panadura- Head Office',
      location: 'Panadura, Sri Lanka',
      type: 'HQ',
      status: 'ACTIVE',
      organizationId: org.id
    }
  })
  console.log(`🏰 ROOT ESTABLISHED: ${hq.name}`)

  // 4. ESTABLISH REGIONAL HUBS
  const regions = [
    { name: 'Western Regional Hub', location: 'Colombo District', status: 'ACTIVE' },
    { name: 'Southern Regional Hub', location: 'Galle District', status: 'ACTIVE' },
    { name: 'Central Regional Hub', location: 'Kandy District', status: 'MAINTENANCE' }
  ]

  const regionNodes = []
  for (const r of regions) {
    const node = await prisma.branch.create({
      data: {
        ...r,
        type: 'REGION',
        parentId: hq.id,
        organizationId: org.id
      }
    })
    regionNodes.push(node)
    console.log(`📡 HUB ACTIVATED: ${node.name}`)
  }

  // 5. DEPLOY BRANCH NETWORK
  const branches = [
    // Western Region
    { name: 'Colombo Main', parentIdx: 0, status: 'ACTIVE' },
    { name: 'Kirulapona Branch', parentIdx: 0, status: 'ACTIVE' },
    { name: 'Negombo Regional Office', parentIdx: 0, status: 'ACTIVE' },
    
    // Southern Region
    { name: 'Ambalangoda Branch', parentIdx: 1, status: 'ACTIVE' },
    { name: 'Matara Town Center', parentIdx: 1, status: 'ACTIVE' },
    { name: 'Hambantota Logistics', parentIdx: 1, status: 'PLANNED' },
    
    // Central Region
    { name: 'Kandy Main City', parentIdx: 2, status: 'ACTIVE' },
    { name: 'Kegalle Field Office', parentIdx: 2, status: 'MAINTENANCE' },
    { name: 'Peradeniya Hub', parentIdx: 2, status: 'ACTIVE' }
  ]

  for (const b of branches) {
    await prisma.branch.create({
      data: {
        name: b.name,
        type: 'BRANCH',
        status: b.status,
        parentId: regionNodes[b.parentIdx].id,
        organizationId: org.id
      }
    })
    console.log(`📍 NODE DEPLOYED: ${b.name}`)
  }

  console.log('✨ Institutional Network Expansion Complete.')
}

main()
  .catch(e => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
