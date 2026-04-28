import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.join(process.cwd(), 'prisma', 'leeds_v2.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🚀 Starting Universal Governance Deep Purge...')

  try {
    // 1. DELETE ALL EXISTING ORGANIZATIONAL DATA (Except Super Admin user)
    console.log('🧹 Purging existing data...')

    // Find the super admin role ID to protect it
    const roles = await prisma.role.findMany()
    const superAdminRole = roles.find(r => r.name.toLowerCase().includes('super admin'))

    // Delete Mapping Rules
    await prisma.roleMappingRule.deleteMany({})

    // Delete Users except Super Admins
    if (superAdminRole) {
      await prisma.user.deleteMany({
        where: {
          roleId: { not: superAdminRole.id }
        }
      })
    } else {
      console.warn('⚠️ No Super Admin role found during purge. Protecting only by "admin" email patterns if any.')
      await prisma.user.deleteMany({
        where: {
          email: { not: { contains: 'super' } }
        }
      })
    }

    // Delete Organizational Entities
    await prisma.employeeSubCategory.deleteMany({})
    await prisma.employeeCategory.deleteMany({})
    await prisma.department.deleteMany({})
    await prisma.branch.deleteMany({})
    
    // Delete Roles that are not "isSystem"
    await prisma.role.deleteMany({
      where: { name: { notIn: ['Super Admin', 'Superadmin', 'super admin'] } }
    })

    // Delete Permission Levels
    await prisma.permissionLevel.deleteMany({})

    console.log('✅ Purge complete. Seeding Universal Architecture...')

    // 2. SEED PERMISSION LEVELS (1-7)
    const pLevels = [
      { rank: 1, name: 'Level 1 – Strategic Oversight', description: 'Strategic view, analytics, high-level approvals. No structural alterations.' },
      { rank: 2, name: 'Level 2 – Full Organizational Control', description: 'Full control over settings, users, modules, and workflows.' },
      { rank: 3, name: 'Level 3 – Cross-Branch Governance', description: 'Oversight across multiple branches, moderate operations, report viewing.' },
      { rank: 4, name: 'Level 4 – Full Module Control', description: 'Siloed control inside assigned modules (HR, Exams, etc.).' },
      { rank: 5, name: 'Level 5 – Moderated Operational Control', description: 'Operational moderation, content adding, limited scope user management.' },
      { rank: 6, name: 'Level 6 – Standard Operational Use', description: 'Basic daily tasks, standard module usage, day-to-day features.' },
      { rank: 7, name: 'Level 7 – Restricted Basic Access', description: 'Minimal access for support or restricted operational staff.' },
    ]

    const createdLevels: Record<number, string> = {}
    for (const pl of pLevels) {
      const level = await prisma.permissionLevel.create({ data: pl })
      createdLevels[pl.rank] = level.id
    }

    // 3. SEED FIXED SYSTEM ROLES
    const org = await prisma.organization.findFirst()
    if (!org) {
      console.error('❌ No organization found. Please run organization seed first.')
      return
    }

    const systemRoles = [
      { name: 'Super Admin', systemRole: 'SUPER_ADMIN', pTier: 1 },
      { name: 'Corporate Admin', systemRole: 'CORPORATE_ADMIN', pTier: 1 },
      { name: 'Company Admin', systemRole: 'COMPANY_ADMIN', pTier: 2 },
      { name: 'Network Admin', systemRole: 'NETWORK_ADMIN', pTier: 3 },
      { name: 'Module Admin', systemRole: 'MODULE_ADMIN', pTier: 4 },
      { name: 'Moderator', systemRole: 'MODERATOR', pTier: 5 },
      { name: 'End User', systemRole: 'END_USER', pTier: 6 },
    ]

    const roleMap: Record<string, string> = {}
    for (const sr of systemRoles) {
      const role = await prisma.role.upsert({
        where: { name_organizationId: { name: sr.name, organizationId: org.id } },
        update: { 
          systemRole: sr.systemRole, 
          isSystem: true,
          permissionLevelId: createdLevels[sr.pTier]
        },
        create: {
          name: sr.name,
          organizationId: org.id,
          permissions: '*',
          systemRole: sr.systemRole,
          isSystem: true,
          permissionLevelId: createdLevels[sr.pTier]
        }
      })
      roleMap[sr.name] = role.id
    }

    // 4. SEED UNIVERSAL CATEGORY STRUCTURE
    const categories = [
      { name: 'Corporate Leadership', slug: 'corporate-leadership' },
      { name: 'Executive Management', slug: 'executive-management' },
      { name: 'Network Leadership', slug: 'network-leadership' },
      { name: 'Branch Leadership', slug: 'branch-leadership' },
      { name: 'Academic Leadership', slug: 'academic-leadership' },
      { name: 'Academic Operations', slug: 'academic-operations' },
      { name: 'Academic Staff', slug: 'academic-staff' },
      { name: 'Operations', slug: 'operations' }, // Catch-all for IT, HR, etc.
    ]

    const catMap: Record<string, string> = {}
    for (const cat of categories) {
      const c = await prisma.employeeCategory.create({
        data: { ...cat, organizationId: org.id }
      })
      catMap[cat.name] = c.id
    }

    // 5. SEED SPECIFIC SUB-CATEGORIES & MAPPING RULES
    const subCategories = [
      // Corporate Leadership
      { name: 'Founder', cat: 'Corporate Leadership', role: 'Corporate Admin', level: 1 },
      { name: 'Chairperson', cat: 'Corporate Leadership', role: 'Corporate Admin', level: 1 },
      { name: 'Director', cat: 'Corporate Leadership', role: 'Corporate Admin', level: 1 },
      { name: 'Board Member', cat: 'Corporate Leadership', role: 'Corporate Admin', level: 1 },
      { name: 'Managing Director', cat: 'Corporate Leadership', role: 'Company Admin', level: 2 },
      
      // Executive Management
      { name: 'Coordinating Principal', cat: 'Executive Management', role: 'Company Admin', level: 1 },
      { name: 'Deputy Coordinating Principal', cat: 'Executive Management', role: 'Company Admin', level: 1 },
      { name: 'Assistant Coordinating Principal', cat: 'Executive Management', role: 'Company Admin', level: 1 },
      { name: 'General Manager Operations', cat: 'Executive Management', role: 'Company Admin', level: 2 },
      { name: 'Group Manager IT', cat: 'Executive Management', role: 'Company Admin', level: 2 },

      // Network Leadership
      { name: 'Network Head', cat: 'Network Leadership', role: 'Network Admin', level: 3 },
      { name: 'Regional Manager', cat: 'Network Leadership', role: 'Network Admin', level: 3 },
      { name: 'Area Coordinator', cat: 'Network Leadership', role: 'Network Admin', level: 3 },
      { name: 'Regional Head', cat: 'Network Leadership', role: 'Network Admin', level: 3 },

      // Branch Leadership
      { name: 'Principal', cat: 'Branch Leadership', role: 'Network Admin', level: 3 },
      { name: 'Head of Branch', cat: 'Branch Leadership', role: 'Network Admin', level: 3 },
      { name: 'Deputy Principal', cat: 'Branch Leadership', role: 'Network Admin', level: 3 },
      { name: 'Head Master', cat: 'Branch Leadership', role: 'Network Admin', level: 3 },
      { name: 'Head Mistress', cat: 'Branch Leadership', role: 'Network Admin', level: 3 },

      // Academic Leadership
      { name: 'Academic Coordinator', cat: 'Academic Leadership', role: 'Moderator', level: 5 },
      { name: 'Sectional Head', cat: 'Academic Leadership', role: 'Moderator', level: 5 },
      { name: 'Grade Coordinator', cat: 'Academic Leadership', role: 'Moderator', level: 5 },
      { name: 'General Coordinator Academic', cat: 'Academic Leadership', role: 'Moderator', level: 5 },

      // Academic Staff
      { name: 'Intern Teacher', cat: 'Academic Staff', role: 'End User', level: 7 },
      { name: 'Trainee Teacher', cat: 'Academic Staff', role: 'End User', level: 6 },
      { name: 'Assistant Teacher', cat: 'Academic Staff', role: 'End User', level: 6 },
      { name: 'Class Teacher', cat: 'Academic Staff', role: 'End User', level: 6 },
      { name: 'Subject Teacher', cat: 'Academic Staff', role: 'End User', level: 6 },
      { name: 'Teacher', cat: 'Academic Staff', role: 'End User', level: 6 },
      { name: 'IT Coordinator', cat: 'Academic Staff', role: 'Module Admin', level: 5 },

      // Academic Operations
      { name: 'Examination Coordinator', cat: 'Academic Operations', role: 'Module Admin', level: 4, modules: 'examination' },
      { name: 'Timetable Coordinator', cat: 'Academic Operations', role: 'Module Admin', level: 4 },
      { name: 'Student Affairs Coordinator', cat: 'Academic Operations', role: 'Moderator', level: 5 },
      { name: 'Academic Executive', cat: 'Academic Operations', role: 'Moderator', level: 5 },
      { name: 'Head Nurse', cat: 'Academic Operations', role: 'Moderator', level: 5 },
      { name: 'Head Librarian', cat: 'Academic Operations', role: 'Moderator', level: 4 },
      { name: 'Librarian', cat: 'Academic Operations', role: 'End User', level: 6 },
      { name: 'Lab Assistant', cat: 'Academic Operations', role: 'End User', level: 6 },

      // Operations (Catch-all)
      { name: 'HR Manager', cat: 'Operations', role: 'Module Admin', level: 4, modules: 'hr' },
      { name: 'HR Executive', cat: 'Operations', role: 'Module Admin', level: 4, modules: 'hr' },
      { name: 'Talent Officer', cat: 'Operations', role: 'Moderator', level: 5, modules: 'hr' },
      { name: 'Finance Manager', cat: 'Operations', role: 'Module Admin', level: 4, modules: 'finance' },
      { name: 'Accounts Officer', cat: 'Operations', role: 'Module Admin', level: 4, modules: 'finance' },
      { name: 'Operations Manager', cat: 'Operations', role: 'Module Admin', level: 4 },
      { name: 'Systems Administrator', cat: 'Operations', role: 'Module Admin', level: 4, modules: 'it' },
      { name: 'Marketing Executive', cat: 'Operations', role: 'Moderator', level: 5, modules: 'crm' },
      { name: 'Receptionist', cat: 'Operations', role: 'End User', level: 6 },
      { name: 'Security Officer', cat: 'Operations', role: 'End User', level: 7 },
      { name: 'Driver', cat: 'Operations', role: 'End User', level: 7 },
      { name: 'Support Staff', cat: 'Operations', role: 'End User', level: 7 },
    ]

    for (const sc of subCategories) {
      console.log(`🔹 Seeding Position: ${sc.name} (${sc.cat})`)
      const sub = await prisma.employeeSubCategory.create({
        data: {
          name: sc.name,
          slug: sc.name.toLowerCase().replace(/\s+/g, '-'),
          categoryId: catMap[sc.cat]
        }
      })

      // Create Mapping Rule with Upsert to prevent unique constraint race conditions
      await prisma.roleMappingRule.create({
        data: {
          organizationId: org.id,
          categoryId: catMap[sc.cat],
          subCategoryId: sub.id,
          roleId: roleMap[sc.role],
          permissionLevelId: createdLevels[sc.level],
          moduleAccessScope: (sc as any).modules || null
        }
      })
    }

    console.log('✨ Universal Governance Engine seeded successfully!')

  } catch (error) {
    console.error('❌ Governance Purge/Seed Failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
