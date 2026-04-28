const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

const rawPath = './prisma/leeds_v2.db'
const dbPath = path.join(process.cwd(), rawPath)
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

const categories = [
  {
    name: 'Corporate Leadership',
    slug: 'corporate-leadership',
    subCategories: []
  },
  {
    name: 'Academic',
    slug: 'academic',
    subCategories: ['Academic Leadership', 'Academic Staff']
  },
  {
    name: 'Academic Operations',
    slug: 'academic-operations',
    subCategories: ['Academic Operations Leadership', 'Academic Operations Staff']
  },
  {
    name: 'Operations',
    slug: 'operations',
    subCategories: ['Operations Leadership', 'Operations Staff']
  }
]

async function main() {
  const org = await prisma.organization.findFirst()
  if (!org) {
    console.error('No organization found.')
    return
  }

  for (const cat of categories) {
    let categoryRecord = await prisma.employeeCategory.findFirst({
      where: { name: cat.name }
    })

    if (!categoryRecord) {
      categoryRecord = await prisma.employeeCategory.create({
        data: {
          name: cat.name,
          slug: cat.slug,
          description: cat.name,
          organizationId: org.id
        }
      })
      console.log(`✓ Created category: ${cat.name}`)
    } else {
      console.log(`• Category exists: ${cat.name}`)
    }

    for (const subName of cat.subCategories) {
      const existingSub = await prisma.employeeSubCategory.findFirst({
        where: { name: subName, categoryId: categoryRecord.id }
      })
      if (!existingSub) {
        await prisma.employeeSubCategory.create({
          data: {
            name: subName,
            slug: subName.toLowerCase().replace(/ /g, '-'),
            categoryId: categoryRecord.id
          }
        })
        console.log(`  ✓ Created sub-category: ${subName}`)
      } else {
        console.log(`  • Sub-category exists: ${subName}`)
      }
    }
  }

  // Remove disallowed categories
  const allowed = categories.map(c => c.name)
  const toDelete = await prisma.employeeCategory.findMany({
    where: { name: { notIn: allowed } }
  })
  for (const d of toDelete) {
    console.log(`✗ Removing disallowed category: ${d.name}`)
    // Nullify references in User
    await prisma.user.updateMany({ where: { employeeCategoryId: d.id }, data: { employeeCategoryId: null } })
    // Remove sub-categories
    const subs = await prisma.employeeSubCategory.findMany({ where: { categoryId: d.id } })
    for (const sub of subs) {
      await prisma.user.updateMany({ where: { employeeSubCategoryId: sub.id }, data: { employeeSubCategoryId: null } })
    }
    await prisma.employeeSubCategory.deleteMany({ where: { categoryId: d.id } })
    await prisma.employeeCategory.delete({ where: { id: d.id } })
  }

  console.log('\nDone ✓')
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect() })
