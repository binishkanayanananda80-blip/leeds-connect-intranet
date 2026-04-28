import { prisma } from './prisma'

export const SYSTEM_ROLES = {
  SUPER_ADMIN: 'Super Admin',
  COMPANY_ADMIN: 'Company Admin',
  CORPORATE_ADMIN: 'Corporate Admin',
  NETWORK_ADMIN: 'Network Admin',
  MODULE_ADMIN: 'Module Admin',
  MODERATOR: 'Moderator',
  END_USER: 'End User'
}

/**
 * Resolves the correct role ID for a user based on their organization and categories.
 * If no specific rule is found, it defaults to the 'End User' role for that organization.
 */
export async function resolveUserRole(
  organizationId: string, 
  categoryId: string | null, 
  subCategoryId: string | null
): Promise<string | null> {
  if (!organizationId) return null

  // 1. Check for specific sub-category rule
  if (categoryId && subCategoryId) {
    const specificRule = await prisma.roleMappingRule.findUnique({
      where: {
        organizationId_categoryId_subCategoryId: {
          organizationId,
          categoryId,
          subCategoryId
        }
      },
      select: { roleId: true }
    })
    if (specificRule) return specificRule.roleId
  }

  // 2. Check for general category rule (where sub-category is null)
  if (categoryId) {
    const generalRule = await prisma.roleMappingRule.findFirst({
      where: {
        organizationId,
        categoryId,
        subCategoryId: null
      },
      select: { roleId: true }
    })
    if (generalRule) return generalRule.roleId
  }

  // 3. Fallback to End User role for this organization
  const endUserRole = await prisma.role.findFirst({
    where: { organizationId, systemRole: 'END_USER' },
    select: { id: true }
  })

  return endUserRole?.id || null
}

/**
 * Applies a standard "School Management" template to a new organization.
 * This includes default roles and standard category-to-role mappings.
 */
export async function applySchoolTemplate(organizationId: string) {
  // 1. Create Default Roles
  const roles = await Promise.all(
    Object.entries(SYSTEM_ROLES).map(([key, name]) => 
      prisma.role.upsert({
        where: { name_organizationId: { name, organizationId } },
        update: { systemRole: key },
        create: { 
          name, 
          organizationId, 
          systemRole: key,
          permissions: '{}' // JSON string for legacy support
        }
      })
    )
  )

  const roleMap = roles.reduce((acc, r) => ({ ...acc, [r.systemRole!]: r.id }), {} as Record<string, string>)

  // 2. Create Standard Academic Categories if they don't exist
  const academicCat = await prisma.employeeCategory.upsert({
    where: { name_organizationId: { name: 'Academic', organizationId } },
    update: {},
    create: { name: 'Academic', slug: 'academic', organizationId }
  })

  const adminCat = await prisma.employeeCategory.upsert({
    where: { name_organizationId: { name: 'Administrative', organizationId } },
    update: {},
    create: { name: 'Administrative', slug: 'administrative', organizationId }
  })

  // 3. Create Standard Sub-Categories (Positions)
  const teacherSub = await prisma.employeeSubCategory.upsert({
    where: { name_categoryId: { name: 'Teacher', categoryId: academicCat.id } },
    update: {},
    create: { name: 'Teacher', slug: 'teacher', categoryId: academicCat.id }
  })

  const registrarSub = await prisma.employeeSubCategory.upsert({
    where: { name_categoryId: { name: 'Registrar', categoryId: adminCat.id } },
    update: {},
    create: { name: 'Registrar', slug: 'registrar', categoryId: adminCat.id }
  })

  // 4. Create Default Mapping Rules
  await prisma.roleMappingRule.upsert({
    where: {
      organizationId_categoryId_subCategoryId: {
        organizationId,
        categoryId: academicCat.id,
        subCategoryId: teacherSub.id
      }
    },
    update: { roleId: roleMap['MODERATOR'] },
    create: {
      organizationId,
      categoryId: academicCat.id,
      subCategoryId: teacherSub.id,
      roleId: roleMap['MODERATOR']
    }
  })

  await prisma.roleMappingRule.upsert({
    where: {
      organizationId_categoryId_subCategoryId: {
        organizationId,
        categoryId: adminCat.id,
        subCategoryId: registrarSub.id
      }
    },
    update: { roleId: roleMap['CORPORATE_ADMIN'] },
    create: {
      organizationId,
      categoryId: adminCat.id,
      subCategoryId: registrarSub.id,
      roleId: roleMap['CORPORATE_ADMIN']
    }
  })

  return { success: true }
}
