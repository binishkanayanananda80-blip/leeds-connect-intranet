const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('--- USERS SEARCH ---')
  const users = await prisma.user.findMany({
    select: { 
        email: true, 
        roleId: true, 
        organizationId: true, 
        branchId: true, 
        departmentId: true,
        employeeCategoryId: true,
        employeeSubCategoryId: true
    }
  })
  
  console.log(JSON.stringify(users, null, 2))

  await prisma.$disconnect()
}

main().catch(err => { console.error(err); process.exit(1); })
