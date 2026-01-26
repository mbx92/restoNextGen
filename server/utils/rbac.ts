import type { UserRole } from "@prisma/client";
import { usePrisma } from "./prisma";

/**
 * LEGACY: Static permission matrix (kept for backward compatibility and fallback)
 * New system uses database-driven RBAC with business type templates
 */
export const PERMISSIONS: Record<string, UserRole[]> = {
  // User Management
  MANAGE_USERS: ["OWNER", "MANAGER"],
  VIEW_USERS: ["OWNER", "MANAGER"],

  // Menu Management
  MANAGE_MENU: ["OWNER", "MANAGER"],
  VIEW_MENU: ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN", "CUSTOMER"],

  // Category Management
  MANAGE_CATEGORIES: ["OWNER", "MANAGER"],

  // Orders
  CREATE_ORDER: ["OWNER", "MANAGER", "CASHIER", "WAITER", "CUSTOMER"],
  VIEW_ALL_ORDERS: ["OWNER", "MANAGER", "KITCHEN"],
  VIEW_OWN_ORDERS: ["CUSTOMER"],
  UPDATE_ORDER_STATUS: ["OWNER", "MANAGER", "CASHIER", "KITCHEN"],
  CANCEL_ORDER: ["OWNER", "MANAGER", "CASHIER"],

  // Tables
  MANAGE_TABLES: ["OWNER", "MANAGER"],
  VIEW_TABLES: ["OWNER", "MANAGER", "WAITER"],

  // Reservations
  MANAGE_RESERVATIONS: ["OWNER", "MANAGER", "WAITER"],
  VIEW_RESERVATIONS: ["OWNER", "MANAGER", "WAITER"],
  CREATE_RESERVATION: ["CUSTOMER"],

  // Payments
  PROCESS_PAYMENT: ["OWNER", "MANAGER", "CASHIER"],
  VIEW_PAYMENTS: ["OWNER", "MANAGER", "CASHIER"],

  // Reviews
  MODERATE_REVIEWS: ["OWNER", "MANAGER"],
  WRITE_REVIEW: ["CUSTOMER"],

  // Site Settings & Theme
  MANAGE_SETTINGS: ["OWNER"],
  MANAGE_THEME: ["OWNER"],

  // Landing Page Content
  MANAGE_LANDING: ["OWNER", "MANAGER"],

  // Dashboard & Analytics
  VIEW_DASHBOARD: ["OWNER", "MANAGER"],
  VIEW_ANALYTICS: ["OWNER", "MANAGER"],

  // Kitchen Display
  VIEW_KITCHEN_DISPLAY: ["KITCHEN"],
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * NEW: Database-driven permission check
 * Checks if a user has permission based on:
 * 1. Business type template (feature availability)
 * 2. Role-permission matrix
 * 3. Optional tenant-specific override
 */
export async function hasPermission(
  tenantId: string,
  role: UserRole,
  permissionCode: string,
): Promise<boolean> {
  const prisma = usePrisma();

  // OWNER always has full access
  if (role === "OWNER") {
    return true;
  }

  try {
    // 1. Get tenant's business type
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { businessType: true },
    });

    if (!tenant) return false;

    // 2. Check business type has this permission
    const permission = await prisma.permission.findUnique({
      where: { code: permissionCode },
    });

    if (!permission) {
      // Fallback to static matrix if permission not in DB
      const allowedRoles = PERMISSIONS[permissionCode as Permission];
      return allowedRoles ? allowedRoles.includes(role) : false;
    }

    const businessTypePermission =
      await prisma.businessTypePermission.findFirst({
        where: {
          businessType: tenant.businessType,
          permissionId: permission.id,
          isEnabled: true,
        },
      });

    if (!businessTypePermission) {
      return false; // Business type doesn't support this feature
    }

    // 3. Check role has permission
    const roleRecord = await prisma.role.findUnique({
      where: { code: role },
    });

    if (!roleRecord) return false;

    const rolePermission = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: roleRecord.id,
          permissionId: permission.id,
        },
      },
    });

    if (!rolePermission) return false; // Role doesn't have this permission

    // 4. Check for tenant-specific override
    const override = await prisma.tenantPermissionOverride.findUnique({
      where: {
        tenantId_permissionId_roleCode: {
          tenantId,
          permissionId: permission.id,
          roleCode: role,
        },
      },
    });

    if (override) {
      return override.isGranted; // Override takes precedence
    }

    return true; // All checks passed
  } catch (error) {
    console.error("Permission check error:", error);
    // Fallback to static matrix on error
    const allowedRoles = PERMISSIONS[permissionCode as Permission];
    return allowedRoles ? allowedRoles.includes(role) : false;
  }
}

/**
 * LEGACY: Static permission check (kept for backward compatibility)
 * Use hasPermission() for new code
 */
export function hasPermissionStatic(
  role: UserRole,
  permission: Permission,
): boolean {
  const allowedRoles = PERMISSIONS[permission];
  return allowedRoles ? allowedRoles.includes(role) : false;
}

/**
 * Check if a user has any of the specified permissions (sync version using static matrix)
 */
export function hasAnyPermissionStatic(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.some((permission) =>
    hasPermissionStatic(role, permission),
  );
}

/**
 * Check if a user has all of the specified permissions (sync version using static matrix)
 */
export function hasAllPermissionsStatic(
  role: UserRole,
  permissions: Permission[],
): boolean {
  return permissions.every((permission) =>
    hasPermissionStatic(role, permission),
  );
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: UserRole): Permission[] {
  return Object.entries(PERMISSIONS)
    .filter(([_, allowedRoles]) => allowedRoles.includes(role))
    .map(([permission]) => permission as Permission);
}

/**
 * Role hierarchy for comparison
 */
const ROLE_HIERARCHY: Record<UserRole, number> = {
  OWNER: 5,
  MANAGER: 4,
  CASHIER: 3,
  WAITER: 3,
  KITCHEN: 3,
  CUSTOMER: 1,
};

/**
 * Check if roleA has higher or equal priority than roleB
 */
export function hasHigherOrEqualRole(
  roleA: UserRole,
  roleB: UserRole,
): boolean {
  return ROLE_HIERARCHY[roleA] >= ROLE_HIERARCHY[roleB];
}
