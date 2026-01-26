/**
 * GET /api/platform/rbac/roles
 * List all roles with their permissions (platform admin only)
 */
export default defineEventHandler(async (event) => {
  // TODO: Add platform admin auth check
  const prisma = usePrisma();

  const roles = await prisma.role.findMany({
    include: {
      rolePermissions: {
        include: {
          permission: true,
        },
      },
      _count: {
        select: {
          businessTypeRoles: true,
        },
      },
    },
    orderBy: { hierarchy: "desc" },
  });

  return roles;
});
