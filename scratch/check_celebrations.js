const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const celebrations = await prisma.celebration.findMany({
      orderBy: { publishDate: 'desc' },
      take: 5,
      include: { user: true }
    });
    console.log(JSON.stringify(celebrations, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
