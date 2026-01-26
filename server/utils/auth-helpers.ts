import type { UserRole } from "@prisma/client";
import type { H3Event } from "h3";
import type { Permission } from "../utils/rbac";
import { hasPermission } from "../utils/rbac";

/**
 * Extended user session for RBAC
 */
export interface UserSessionWithRole {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    tenantId: string | null;
    tenantSlug?: string;
    businessType?: string;
  };
}

/**
 * Require user authentication (any role)
 */
export async function requireUser(
  event: H3Event,
): Promise<UserSessionWithRole> {
  const session = await getUserSession(event);

  // Type guard: check if session has required user data
  if (
    !session ||
    !session.user ||
    typeof session.user !== "object" ||
    !("id" in session.user) ||
    !("email" in session.user) ||
    !("role" in session.user)
  ) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - Please login",
    });
  }

  // Safe cast after validation
  return session as unknown as UserSessionWithRole;
}

/**
 * Require specific permission
 */
export async function requirePermission(
  event: H3Event,
  permission: Permission,
): Promise<UserSessionWithRole> {
  const session = await requireUser(event);
  const userRole = session.user.role;
  const tenantId = session.user.tenantId;

  if (!tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: No tenant associated with user",
    });
  }

  // hasPermission signature: (tenantId, role, permissionCode)
  const allowed = await hasPermission(tenantId, userRole, permission);
  if (!allowed) {
    throw createError({
      statusCode: 403,
      statusMessage: `Forbidden: Requires ${permission} permission`,
    });
  }

  return session;
}

/**
 * Require any of the specified roles
 */
export async function requireRole(
  event: H3Event,
  roles: UserRole[],
): Promise<UserSessionWithRole> {
  const session = await requireUser(event);
  const userRole = session.user.role;

  if (!roles.includes(userRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Forbidden: Requires one of these roles: ${roles.join(", ")}`,
    });
  }

  return session;
}

/**
 * Check if user is owner or manager (admin-level access)
 */
export async function requireAdminRole(
  event: H3Event,
): Promise<UserSessionWithRole> {
  return requireRole(event, ["OWNER", "MANAGER"]);
}

/**
 * Check if user can access specific tenant
 */
export async function requireTenantAccess(
  event: H3Event,
  tenantId: string,
): Promise<UserSessionWithRole> {
  const session = await requireUser(event);

  if (session.user.tenantId !== tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Cannot access this tenant",
    });
  }

  return session;
}
