import { prisma } from "./prisma";
import { auth } from "@/auth";

export type ERPModule = "intranet" | "hr" | "finance" | "school" | "examination" | "transport" | "crm" | "data-management";

export type ERPAction = "view" | "create" | "edit" | "delete" | "approve" | "configure";

/**
 * The CORE ERP Access Engine
 * Implements the 6-factor Permission Matrix across all modules.
 */
export async function can(module: ERPModule, action: ERPAction): Promise<boolean> {
  const session = await auth();
  const user = session?.user as any;

  if (!user?.id) return false;

  // 1. Super Admin Bypass
  if (user.roleName?.toLowerCase() === "super admin") return true;

  // 2. Fetch the permission matrix for the user's role and requested module
  const permission = await prisma.permissionMatrix.findUnique({
    where: {
      roleId_moduleSlug: {
        roleId: user.roleId,
        moduleSlug: module,
      },
    },
  });

  if (!permission) return false;

  // 3. Map action to matrix field
  switch (action) {
    case "view": return permission.canView;
    case "create": return permission.canCreate;
    case "edit": return permission.canEdit;
    case "delete": return permission.canDelete;
    case "approve": return permission.canApprove;
    case "configure": return permission.canConfig;
    default: return false;
  }
}

/**
 * Check if the user has access to a specific branch for a module.
 * Future enhancement for branch-level restrictions.
 */
export async function canAtBranch(module: ERPModule, action: ERPAction, branchId: string): Promise<boolean> {
  const session = await auth();
  const user = session?.user as any;

  if (!user?.id) return false;

  // Super Admin can do anything anywhere
  if (user.roleName === "Super Admin") return true;

  // Basic check for now: if admin, allow. 
  // Future: Query UserBranchModule table
  if (user.branchId === branchId) {
    return can(module, action);
  }

  // Branch Admins restricted to their own branch
  if (user.roleName === "Branch Admin" && user.branchId !== branchId) return false;

  return can(module, action);
}

export type Role = 'Super Admin' | 'Module Admin' | 'Moderator' | 'User';

export async function getUserRole() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { role: true, category: true }
  });

  if (!employee) return null;

  return {
    roleName: employee.role?.name,
    isSuperAdmin: employee.role?.name === 'Super Admin',
    isModuleAdmin: employee.role?.name === 'Module Admin',
    isModerator: employee.role?.name === 'Moderator',
    isUser: employee.role?.name === 'User',
    isCorporateLeadership: employee.category?.name === 'Corporate Leadership',
    categoryId: employee.categoryId,
    categoryName: employee.category?.name,
  };
}

export async function canAccessAdminPanel() {
  const role = await getUserRole();
  if (!role) return false;
  return role.isSuperAdmin || role.isModuleAdmin || role.isModerator;
}

export function canSeeContent(
  contentAudienceFlags: string | null | undefined,
  userCategoryId: string | null | undefined,
  isCorporateLeadership: boolean
) {
  if (isCorporateLeadership) return true;
  if (!contentAudienceFlags) return true; 
  if (!userCategoryId) return false;

  const flags = contentAudienceFlags.split(',').map(f => f.trim());
  return flags.includes(userCategoryId);
}
