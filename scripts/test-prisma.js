const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const emps = await prisma.employee.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true, isActive: true, entityStatus: true } },
        branch: { select: { id: true, name: true } },
        role: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
      }
    });
    console.log('Success! Found', emps.length, 'employees');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
