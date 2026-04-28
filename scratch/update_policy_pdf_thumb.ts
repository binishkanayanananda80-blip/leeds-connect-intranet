import { prisma } from '../src/lib/prisma'

async function update() {
  try {
    await prisma.article.update({ 
      where: { id: 'cmogylo0g0002psu67vwu1wkh' }, 
      data: { imageUrl: '/uploads/knowledge/communication_policy_thumbnail.png' } 
    })
    console.log('✅ Updated Communication Policy article with PDF snapshot image URL.')
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
}

update()
