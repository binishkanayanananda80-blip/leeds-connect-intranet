import { prisma } from '../src/lib/prisma'

function slugify(text: string) {
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
}

async function run() {
  try {
    const categories = await prisma.employeeCategory.findMany()
    const subCategories = await prisma.employeeSubCategory.findMany()

    const corpLead = categories.find(c => c.name === 'Corporate Leadership')
    if (corpLead) {
      const required = ['Founder', 'Chairperson', 'Managing Director', 'Directress']
      
      for (const name of required) {
        const exists = subCategories.find(sc => sc.name === name && sc.categoryId === corpLead.id)
        if (!exists) {
          console.log(`Adding ${name} to Corporate Leadership...`)
          await prisma.employeeSubCategory.create({
            data: {
              name,
              slug: slugify(name),
              categoryId: corpLead.id
            }
          })
          console.log(`✅ Added ${name}`)
        } else {
          console.log(`${name} already exists.`)
        }
      }
    }
    
    // Also check other requested categories to ensure subcategories exist
    const mapping: Record<string, string[]> = {
      'Operations': ['Operations Leadership', 'Operations Staff'],
      'Academic Operations': ['Academic Operations Leadership', 'Academic Operations Staff'],
      'Academic': ['Academic Leadership', 'Academic Staff']
    }

    for (const [catName, subNames] of Object.entries(mapping)) {
      const cat = categories.find(c => c.name === catName)
      if (cat) {
        for (const subName of subNames) {
          if (!subCategories.find(sc => sc.name === subName && sc.categoryId === cat.id)) {
            console.log(`Adding ${subName} to ${catName}...`)
            await prisma.employeeSubCategory.create({
              data: {
                name: subName,
                slug: slugify(subName),
                categoryId: cat.id
              }
            })
            console.log(`✅ Added ${subName}`)
          }
        }
      }
    }

  } catch (err) {
    console.error(err)
  } finally {
    await prisma.$disconnect()
  }
}

run()
