import { prisma } from '../src/lib/prisma'

async function verify() {
  try {
    console.log('Checking prisma.contentItem...')
    if (prisma.contentItem) {
      console.log('✅ prisma.contentItem is defined!')
      const count = await prisma.contentItem.count()
      console.log(`Current content items count: ${count}`)
    } else {
      console.error('❌ prisma.contentItem is STILL undefined!')
    }
  } catch (err) {
    console.error('❌ Error during verification:', err)
  } finally {
    await prisma.$disconnect()
  }
}

verify()
