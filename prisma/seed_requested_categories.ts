import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

async function seed() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  const categories = [
    'Corporate Leadership',
    'Executive Leadership',
    'Network Leadership',
    'Academic Leadership',
    'Branch Leadership',
    'Academic Operations Leadership',
    'Operations Leadership',
    'Academic',
    'Operations',
    'Support Staff'
  ]

  console.log('Seeding requested employee categories...')

  for (const name of categories) {
    const slug = name.toLowerCase().replace(/ /g, '-')
    await prisma.employeeCategory.upsert({
      where: { slug },
      update: { name },
      create: {
        name,
        slug,
        description: `Requested staff category for ${name}`,
        organizationId: 'leeds' // Current default
      }
    })
  }

  console.log('Successfully seeded categories.')
  await prisma.$disconnect()
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
