const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const result = await prisma.$queryRawUnsafe(`SELECT id, title, staffName, userId FROM Celebration ORDER BY publishDate DESC LIMIT 5`);
  console.log(result);
}
run().catch(console.error).finally(() => prisma.$disconnect());
