import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'prisma/leeds_v2.db');
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Get or Create Organization
  let org = await prisma.organization.findFirst({ where: { name: 'Leeds International School' }});
  if (!org) {
    org = await prisma.organization.create({
      data: {
        name: 'Leeds International School',
        slug: 'leeds-international-school'
      }
    });
  }

  // Get or Create Branch
  let branch = await prisma.branch.findFirst({ where: { name: 'All Branches' }});
  if (!branch) {
    branch = await prisma.branch.create({
      data: {
        name: 'All Branches',
        organizationId: org.id
      }
    });
  }

  // Get or Create Role
  let role = await prisma.role.findFirst({ where: { name: 'Super Admin' }});
  if (!role) {
    role = await prisma.role.create({
      data: {
        name: 'Super Admin',
        permissions: '*',
        systemRole: 'SUPER_ADMIN',
        organizationId: org.id
      }
    });
  }

  // Get or Create EmployeeCategory
  let category = await prisma.employeeCategory.findFirst({ where: { name: 'Corporate Leadership' }});
  if (!category) {
    category = await prisma.employeeCategory.create({
      data: {
        name: 'Corporate Leadership',
        slug: 'corporate-leadership',
        organizationId: org.id
      }
    });
  }

  const hashed = await bcrypt.hash('Passo@2026', 12);

  // Upsert User
  const user = await prisma.user.upsert({
    where: { email: 'admin@leeds.lk' },
    update: {
      password: hashed,
      entityId: '000000',
      roleId: role.id,
      branchId: branch.id,
      employeeCategoryId: category.id,
      forcePasswordChange: false
    },
    create: {
      email: 'admin@leeds.lk',
      name: 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',
      password: hashed,
      entityId: '000000',
      roleId: role.id,
      branchId: branch.id,
      employeeCategoryId: category.id,
      forcePasswordChange: false,
      organizationId: org.id
    }
  });

  // Upsert Employee
  const emp = await prisma.employee.upsert({
    where: { employeeNumber: '000000' },
    update: {
      passwordHash: hashed,
      passwordChanged: true,
      userId: user.id
    },
    create: {
      employeeNumber: '000000',
      firstName: 'Super',
      lastName: 'Admin',
      branchId: branch.id,
      roleId: role.id,
      categoryId: category.id,
      passwordHash: hashed,
      passwordChanged: true,
      userId: user.id
    }
  });

  console.log('Super Admin created successfully!', emp);
}

main().finally(() => prisma.$disconnect());
