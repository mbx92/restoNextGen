import type { UserRole } from "@prisma/client";
import type { Permission } from "~/server/utils/rbac";
import { PERMISSIONS } from "~/server/utils/rbac";

/**
 * Composable for checking user permissions in Vue components
 * Uses static permission matrix for client-side checks
 * For server-side checks, use hasPermission() in API routes
 */
export function usePermissions() {
  const route = useRoute();

  // Auto-detect session endpoint based on route
  const sessionEndpoint = route.path.startsWith("/admin")
    ? "/api/admin/auth/session"
    : "/api/auth/session";

  const { data: session } = useFetch(sessionEndpoint);

  const userRole = computed<UserRole | null>(() => {
    return (session.value?.user?.role as UserRole) || null;
  });

  const can = (permission: Permission): boolean => {
    if (!userRole.value) return false;
    const allowedRoles = PERMISSIONS[permission];
    return allowedRoles ? allowedRoles.includes(userRole.value) : false;
  };

  const canAny = (permissions: Permission[]): boolean => {
    return permissions.some((p) => can(p));
  };

  const canAll = (permissions: Permission[]): boolean => {
    return permissions.every((p) => can(p));
  };

  const isRole = (role: UserRole): boolean => {
    return userRole.value === role;
  };

  const isAnyRole = (roles: UserRole[]): boolean => {
    if (!userRole.value) return false;
    return roles.includes(userRole.value);
  };

  const isStaff = computed(() => {
    if (!userRole.value) return false;
    return ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"].includes(
      userRole.value,
    );
  });

  const isAdmin = computed(() => {
    if (!userRole.value) return false;
    return ["OWNER", "MANAGER"].includes(userRole.value);
  });

  return {
    userRole,
    can,
    canAny,
    canAll,
    isRole,
    isAnyRole,
    isStaff,
    isAdmin,
  };
}
