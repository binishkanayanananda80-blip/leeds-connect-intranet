const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const emps = await prisma.employee.findMany({
      include: {
        category: { select: { id: true, name: true } }
      }
    });
    console.log('OK', emps.length);
  } catch (e) {
    console.error('ERROR', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
