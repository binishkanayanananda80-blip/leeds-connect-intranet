const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const columns = await prisma.$queryRaw`PRAGMA table_info(GroupMember)`;
    console.log(JSON.stringify(columns, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
