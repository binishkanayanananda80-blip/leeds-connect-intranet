import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma/leeds_v2.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Starting Institutional Module Reset...')

  // 1. Find the primary organization
  const org = await prisma.organization.findFirst({ select: { id: true, name: true } })
  if (!org) {
    throw new Error('❌ Critical: No organization found in database.')
  }
  console.log(`🏢 Target Organization: ${org.name} (${org.id})`)

  // 2. Clear existing modules
  const { count: deletedCount } = await prisma.module.deleteMany()
  console.log(`🧹 Cleared ${deletedCount} existing modules.`)

  // 3. Define the Core 9
  const coreModules = [
    { name: 'Leeds Connect',       slug: 'leeds-connect',       icon: 'Globe',          desc: 'Primary institutional communication and internal intranet hub.' },
    { name: 'HR Management',       slug: 'hr-management',       icon: 'Briefcase',      desc: 'Institutional human resource administration and personnel governance.' },
    { name: 'Student Hub',        slug: 'student-hub',        icon: 'GraduationCap', desc: 'Centralized student record management and academic life-cycle control.' },
    { name: 'Examination Hub',    slug: 'examination-hub',    icon: 'FileText',      desc: 'Secure institutional grading, assessment, and academic reporting.' },
    { name: 'Transport Hub',      slug: 'transport-hub',      icon: 'Bus',           desc: 'Regional logistics, vehicle tracking, and student transport network.' },
    { name: 'Procurement Hub',    slug: 'procurement-hub',    icon: 'ShoppingCart',  desc: 'Institutional supply chain and equipment acquisition protocols.' },
    { name: 'Asset Registry',     slug: 'asset-registry',     icon: 'Box',            desc: 'Global inventory tracking and institutional asset management.' },
    { name: 'Finance Controller', slug: 'finance-controller', slug_alt: 'finance', icon: 'Wallet', desc: 'Multi-branch fiscal administration and institutional ledger control.' },
    { name: 'CRM Hub',            slug: 'crm-hub',            icon: 'Users',          desc: 'Institutional relationship management and external constituency engagement.' },
  ]

  // 4. Seed the modules
  for (const m of coreModules) {
    await prisma.module.create({
      data: {
        name: m.name,
        slug: m.slug,
        icon: m.icon,
        description: m.desc,
        isActive: true,
        organizationId: org.id
      }
    })
    console.log(`✅ Seeded: ${m.name}`)
  }

  console.log('✨ Institutional Module Synchronization Complete.')
}

main()
  .catch((e) => {
    console.error('❌ Reset failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
