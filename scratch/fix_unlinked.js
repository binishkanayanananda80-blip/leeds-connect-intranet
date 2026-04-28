const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  try {
    const unlinked = await prisma.celebration.findMany({ where: { userId: null } });
    let count = 0;
    for (const celeb of unlinked) {
      if (celeb.staffName) {
        const user = await prisma.user.findFirst({ where: { name: celeb.staffName, isInIntranet: true } });
        if (user) {
          await prisma.celebration.update({
            where: { id: celeb.id },
            data: { userId: user.id }
          });
          count++;
        }
      }
    }
    console.log(`Fixed ${count} unlinked celebrations.`);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

fix();
