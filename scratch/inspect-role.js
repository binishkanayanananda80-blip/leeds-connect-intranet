const { PrismaClient } = require('@prisma/client')
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3')
const path = require('path')

async function main() {
  const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
  const prisma = new PrismaClient({ adapter })

  console.log('--- INSPECTING ROLE RELATIONS ---')
  try {
    const role = await prisma.role.findFirst({
        include: { permissionLevel: true }
    })
    console.log('Success! Found role with permissionLevel:', !!role?.permissionLevel)
  } catch (err) {
    console.error('FAILED to include permissionLevel:', err.message)
    
    console.log('\n--- ATTEMPTING TO INSPECT ROLE OBJECT KEYS ---')
    const roleSimple = await prisma.role.findFirst()
    console.log('Role Keys:', Object.keys(roleSimple || {}))
  }

  await prisma.$disconnect()
}

main()
