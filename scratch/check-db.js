const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('--- ALL USERS ---')
  const users = await prisma.user.findMany({
    include: { 
        role: { 
            include: { permissionLevel: true } 
        },
        employeeCategory: true,
        employeeSubCategory: true
    }
  })
  users.forEach(u => {
    console.log(`[${u.id}] Email: ${u.email} | Role: ${u.role?.name || 'NONE'} | Tier: ${u.role?.permissionLevel?.rank || '--'} | Modules: ${u.activeModules || 'NONE'}`)
    console.log(`      Cat: ${u.employeeCategory?.name || '--'} | SubCat: ${u.employeeSubCategory?.name || '--'}`)
  })

  console.log('\n--- MAPPING RULES ---')
  const rules = await prisma.roleMappingRule.findMany({
    include: {
        category: true,
        subCategory: true,
        role: true
    }
  })
  rules.forEach(r => {
    console.log(`Rule ID: ${r.id} | Cat: ${r.category.name} | SubCat: ${r.subCategory?.name || 'ALL'} -> Role: ${r.role.name} | Modules: ${r.moduleAccessScope}`)
  })

  await prisma.$disconnect()
}

main()
