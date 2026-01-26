/**
 * GET /api/platform/rbac/matrix
 * Get role-permission matrix (platform admin only)
 */
export default defineEventHandler(async (event) => {
  // TODO: Add platform admin auth check
  const prisma = usePrisma();

  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({
      orderBy: { hierarchy: "desc" },
    }),
    prisma.permission.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    }),
  ]);

  // Get all role-permission mappings
  const rolePermissions = await prisma.rolePermission.findMany({
    select: {
      roleId: true,
      permissionId: true,
    },
  });

  // Build matrix map for quick lookup
  const matrixMap = new Map<string, boolean>();
  rolePermissions.forEach((rp) => {
    matrixMap.set(`${rp.roleId}-${rp.permissionId}`, true);
  });

  return {
    roles,
    permissions,
    matrixMap: Object.fromEntries(matrixMap),
  };
});
