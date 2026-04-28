import { prisma } from '../src/lib/prisma'

async function check() {
  try {
    const articles = await prisma.article.findMany({ 
      where: { title: { contains: 'Communication Policy' } } 
    })
    console.log('--- Articles ---')
    console.log(JSON.stringify(articles, null, 2))

    const contentItems = await prisma.contentItem.findMany({ 
      where: { title: { contains: 'Communication Policy' } } 
    })
    console.log('\n--- ContentItems ---')
    console.log(JSON.stringify(contentItems, null, 2))
  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
}

check()
