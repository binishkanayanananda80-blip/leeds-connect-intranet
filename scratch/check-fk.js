const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('--- DIAGNOSTIC: FOREIGN KEY INTEGRITY ---')
  
  // 1. Check all Roles
  const roles = await prisma.role.findMany({ select: { id: true, name: true } })
  const roleIds = new Set(roles.map(r => r.id))
  console.log(`Found ${roles.length} roles.`)

  // 2. Check all Categories/Sub-Categories
  const categories = await prisma.employeeCategory.findMany({ select: { id: true } })
  const catIds = new Set(categories.map(c => c.id))
  const subCategories = await prisma.employeeSubCategory.findMany({ select: { id: true } })
  const subCatIds = new Set(subCategories.map(s => s.id))
  console.log(`Found ${categories.length} categories and ${subCategories.length} sub-categories.`)

  // 3. Check all Mapping Rules for ORPHANS
  const rules = await prisma.roleMappingRule.findMany()
  console.log(`Checking ${rules.length} mapping rules...`)
  rules.forEach(r => {
    if (!roleIds.has(r.roleId)) console.log(`[ORPHAN RULE] Mapping ${r.id} points to non-existent ROLE: ${r.roleId}`)
    if (!catIds.has(r.categoryId)) console.log(`[ORPHAN RULE] Mapping ${r.id} points to non-existent CATEGORY: ${r.categoryId}`)
    if (r.subCategoryId && !subCatIds.has(r.subCategoryId)) console.log(`[ORPHAN RULE] Mapping ${r.id} points to non-existent SUB-CATEGORY: ${r.subCategoryId}`)
  })

  // 4. Check for Organization exists
  const orgs = await prisma.organization.findMany({ select: { id: true }})
  console.log(`Found ${orgs.length} organizations.`)
  if (orgs.length === 0) console.log('[CRITICAL] No organizations found!')

  // 5. Check if Admin has valid org
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@leeds.lk' },
    select: { organizationId: true }
  })
  console.log(`Admin organizationId: ${admin?.organizationId}`)
  if (admin?.organizationId && !orgs.map(o => o.id).includes(admin.organizationId)) {
    console.log(`[CRITICAL] Admin organizationId ${admin.organizationId} does NOT exist!`)
  }

  await prisma.$disconnect()
}

main().catch(err => {
    console.error(err)
    process.exit(1)
})
