
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv').config()

async function main() {
  console.log('--- CLOUD DATA AUDIT ---')
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })
  
  try {
    const userCount = await prisma.user.count()
    const orgs = await prisma.organization.findMany()
    const employees = await prisma.employee.count()
    
    console.log('Total Users in PG:', userCount)
    console.log('Total Employees in PG:', employees)
    console.log('Organizations in PG:', orgs.map(o => o.id))
    
    if (userCount > 0) {
      const sample = await prisma.user.findFirst()
      console.log('Sample User Org ID:', sample.organizationId)
    }

  } catch (e) {
    console.error('Audit failed:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
