const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma/leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  try {
    const employee = await prisma.employee.findUnique({
      where: { employeeNumber: 'PAN000002' },
      include: { user: true }
    })
    console.log('Employee PAN000002:', employee ? 'Found' : 'Not Found')
    if (employee) {
      console.log('User Name:', employee.user?.name)
    }
  } catch (err) {
    console.error('Error:', err.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
