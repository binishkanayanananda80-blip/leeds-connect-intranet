
const { PrismaClient } = require('@prisma/client')
const { PrismaPg } = require('@prisma/adapter-pg')
const { Pool } = require('pg')
require('dotenv').config()

async function main() {
  console.log('Verifying Supabase connection using PrismaPg adapter...')
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  const prisma = new PrismaClient({ adapter })
  
  try {
    const userCount = await prisma.user.count()
    console.log('Connection successful! Table "User" found. Current users in Supabase:', userCount)
    console.log('PostgreSQL migration is ready for data transfer.')
  } catch (e) {
    console.error('Connection failed:', e.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()
