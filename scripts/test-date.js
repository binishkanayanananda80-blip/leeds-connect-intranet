const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    const u = await prisma.user.findFirst({ where: { entityId: 'PAN000001' } });
    console.log(u.dateOfBirth, u.dateOfBirth instanceof Date);
    
    // Also check all birthdays
    const users = await prisma.user.findMany({ where: { dateOfBirth: { not: null }, isInIntranet: true }});
    users.forEach(u => {
      console.log(u.name, typeof u.dateOfBirth, u.dateOfBirth instanceof Date, u.dateOfBirth);
    });
  } catch (e) {
    console.error('ERROR', e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
