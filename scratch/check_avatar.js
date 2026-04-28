const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const celebration = await prisma.celebration.findFirst({
      orderBy: { publishDate: 'desc' },
      include: { user: true }
    });
    console.log("Latest Celebration:");
    console.log(JSON.stringify(celebration, null, 2));

    if (celebration.userId) {
      const user = await prisma.user.findUnique({ where: { id: celebration.userId } });
      console.log("\nLinked User:");
      console.log(JSON.stringify(user, null, 2));
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
