'use server'

import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import bcrypt from 'bcryptjs'

// ── Helper: Write Audit Log ──────────────────────────────────────────
async function writeAuditLog(actorId: string, action: string, entity: string, entityId: string, details: string) {
  try {
    const org = await prisma.organization.findFirst()
    if (!org) return
    await prisma.auditLog.create({
      data: { userId: actorId, organizationId: org.id, action, entity, entityId, details }
    })
  } catch (e) {
    console.error('[AuditLog Error]', e)
  }
}

// ── Create Employee ──────────────────────────────────────────────────
export async function createEmployee(data: {
  firstName: string
  middleName?: string
  lastName: string
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
  mobileNumber?: string
  landPhoneNumber?: string
  nicNumber?: string
  dateOfBirth?: Date
  dateOfJoined?: Date
  employeeNumber: string
  branchId?: string
  roleId?: string
  categoryId?: string
  subCategoryId?: string
  departmentId?: string
  designation?: string
  imageUrl?: string  // public URL path e.g. /uploads/avatars/xxx.jpg
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  const defaultPassword = 'password123'
  const passwordHash = await bcrypt.hash(defaultPassword, 12)

  try {
    const org = await prisma.organization.findFirst()
    if (!org) return { error: 'No organization configured.' }

    const user = await prisma.user.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        name: `${data.firstName}${data.middleName ? ' ' + data.middleName : ''} ${data.lastName}`,
        email: `${data.employeeNumber.toLowerCase()}@leeds.lk`,
        password: passwordHash,
        forcePasswordChange: true,
        entityId: data.employeeNumber,
        organizationId: org.id,
        roleId: data.roleId || null,
        branchId: data.branchId || null,
        employeeCategoryId: data.categoryId || null,
        employeeSubCategoryId: data.subCategoryId || null,
        departmentId: data.departmentId || null,
        designation: data.designation || null,
        image: data.imageUrl || null,
        isInIntranet: true, // Auto-add to directory
        joinedDate: data.dateOfJoined || new Date(),
        dateOfBirth: data.dateOfBirth || null,
        mobileNumber: data.mobileNumber || null,
        isActive: true,
        entityStatus: 'ACTIVE',
        employee: {
          create: {
            employeeNumber: data.employeeNumber,
            firstName: data.firstName,
            middleName: data.middleName || null,
            lastName: data.lastName,
            addressLine1: data.addressLine1 || null,
            addressLine2: data.addressLine2 || null,
            addressLine3: data.addressLine3 || null,
            mobileNumber: data.mobileNumber || null,
            landPhoneNumber: data.landPhoneNumber || null,
            nicNumber: data.nicNumber || null,
            dateOfBirth: data.dateOfBirth || null,
            dateOfJoined: data.dateOfJoined || null,
            branchId: data.branchId || null,
            roleId: data.roleId || null,
            categoryId: data.categoryId || null,
            subCategoryId: data.subCategoryId || null,
            departmentId: data.departmentId || null,
            designation: data.designation || null,
            passwordHash,
            passwordChanged: false,
          }
        }
      }
    })

    await writeAuditLog(
      session.user.id, 'CREATE', 'EMPLOYEE', user.id,
      `Created employee ${data.firstName} ${data.lastName} (${data.employeeNumber})`
    )

    return { success: true, employeeNumber: data.employeeNumber }
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') return { error: 'Employee Number or Email already exists.' }
    return { error: `Failed to create employee: ${error.message}` }
  }
}
// ── Update Employee ──────────────────────────────────────────────────
export async function updateEmployee(userId: string, data: {
  firstName: string
  middleName?: string
  lastName: string
  addressLine1?: string
  addressLine2?: string
  addressLine3?: string
  mobileNumber?: string
  landPhoneNumber?: string
  nicNumber?: string
  dateOfBirth?: Date
  dateOfJoined?: Date
  employeeNumber: string
  branchId?: string
  roleId?: string
  categoryId?: string
  subCategoryId?: string
  departmentId?: string
  designation?: string
  imageUrl?: string
}) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  try {
    const updateData: any = {
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName}${data.middleName ? ' ' + data.middleName : ''} ${data.lastName}`,
      entityId: data.employeeNumber,
      roleId: data.roleId || null,
      branchId: data.branchId || null,
      employeeCategoryId: data.categoryId || null,
      employeeSubCategoryId: data.subCategoryId || null,
      departmentId: data.departmentId || null,
      designation: data.designation || null,
      joinedDate: data.dateOfJoined || undefined,
      dateOfBirth: data.dateOfBirth || null,
      mobileNumber: data.mobileNumber || null,
      employee: {
        update: {
          employeeNumber: data.employeeNumber,
          firstName: data.firstName,
          middleName: data.middleName || null,
          lastName: data.lastName,
          addressLine1: data.addressLine1 || null,
          addressLine2: data.addressLine2 || null,
          addressLine3: data.addressLine3 || null,
          mobileNumber: data.mobileNumber || null,
          landPhoneNumber: data.landPhoneNumber || null,
          nicNumber: data.nicNumber || null,
          dateOfBirth: data.dateOfBirth || null,
          dateOfJoined: data.dateOfJoined || null,
          branchId: data.branchId || null,
          roleId: data.roleId || null,
          categoryId: data.categoryId || null,
          subCategoryId: data.subCategoryId || null,
          departmentId: data.departmentId || null,
          designation: data.designation || null,
        }
      }
    }
    
    if (data.imageUrl !== undefined) {
      updateData.image = data.imageUrl
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    })

    await writeAuditLog(
      session.user.id, 'UPDATE', 'EMPLOYEE', userId,
      `Updated employee ${data.firstName} ${data.lastName} (${data.employeeNumber})`
    )

    return { success: true }
  } catch (error: any) {
    console.error(error)
    if (error.code === 'P2002') return { error: 'Employee Number or Email already exists.' }
    return { error: `Failed to update employee: ${error.message}` }
  }
}

// ── Fetch All Branches ───────────────────────────────────────────────
export async function getBranches() {
  return prisma.branch.findMany({
    where: { name: { notIn: ['Network-wide', 'All Branches'] } },
    orderBy: { name: 'asc' }
  })
}

// ── Fetch All Roles ──────────────────────────────────────────────────
export async function getRoles() {
  return prisma.role.findMany({ orderBy: { name: 'asc' } })
}

// ── Fetch All Departments ───────────────────────────────────────────────
export async function getDepartments() {
  return prisma.department.findMany({ orderBy: { name: 'asc' } })
}

// ── Fetch Employee Sub Categories ───────────────────────────────────
export async function getEmployeeSubCategories(categoryId?: string) {
  const where = categoryId ? { categoryId } : {}
  return prisma.employeeSubCategory.findMany({ where, orderBy: { name: 'asc' } })
}

// ── Fetch All Employee Categories ───────────────────────────────────
export async function getEmployeeCategories() {
  const categories = await prisma.employeeCategory.findMany({ orderBy: { name: 'asc' } })
  const allowed = ['Corporate Leadership', 'Academic', 'Academic Operations', 'Operations']
  return categories.filter(c => allowed.includes(c.name))
}

// ── Fetch Employees by Branch ────────────────────────────────────────
export async function getEmployeesByBranch(branchId: string | 'ALL') {
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  const isSuperAdmin = roleName === 'Super Admin'

  const where: any = branchId === 'ALL' ? {} : { branchId }
  
  // Hide Super Admins from everyone except Super Admins
  if (!isSuperAdmin) {
    where.role = { name: { not: 'Super Admin' } }
  }

  return prisma.employee.findMany({
    where,
    include: {
      user: { 
        select: { 
          id: true, 
          name: true, 
          email: true, 
          image: true, 
          isActive: true, 
          entityStatus: true 
        } 
      },
      branch: { select: { id: true, name: true } },
      role: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      subCategory: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
    },
    orderBy: { firstName: 'asc' }
  })
}

// ── Suspend Employee ─────────────────────────────────────────────────
export async function suspendEmployee(userId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false, entityStatus: 'INACTIVE' }
  })

  await writeAuditLog(session.user.id, 'SUSPEND', 'EMPLOYEE', userId, `Suspended employee account`)
  return { success: true }
}

// ── Reactivate Employee ──────────────────────────────────────────────
export async function reactivateEmployee(userId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: true, entityStatus: 'ACTIVE' }
  })

  await writeAuditLog(session.user.id, 'REACTIVATE', 'EMPLOYEE', userId, `Reactivated employee account`)
  return { success: true }
}

// ── Delete Employee (Super Admin only) ──────────────────────────────
export async function deleteEmployee(userId: string) {
  const session = await auth()
  const roleName = (session?.user as any)?.roleName
  if (!['Super Admin', 'Corporate Admin'].includes(roleName)) return { error: 'Unauthorized' }

  const emp = await prisma.employee.findUnique({ where: { userId }, include: { user: true } })
  const name = emp?.user?.name || userId

  // Cascade deletes user (and employee via onDelete: Cascade)
  await prisma.user.delete({ where: { id: userId } })

  await writeAuditLog(session!.user!.id!, 'DELETE', 'EMPLOYEE', userId, `Permanently deleted employee: ${name}`)
  return { success: true }
}

// ── Get Audit Logs ──────────────────────────────────────────────────
export async function getAuditLogs(limit = 200) {
  return prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: { name: true, image: true } } }
  })
}

// ── Update Employee Image ────────────────────────────────────────────
export async function updateEmployeeImage(userId: string, imageUrl: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: 'Unauthorized' }

  await prisma.user.update({
    where: { id: userId },
    data: { image: imageUrl }
  })

  await writeAuditLog(session.user.id, 'UPDATE', 'EMPLOYEE', userId, `Updated profile photo`)
  return { success: true }
}
