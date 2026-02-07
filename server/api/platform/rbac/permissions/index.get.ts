import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * GET /api/platform/rbac/permissions
 * List all permissions (platform admin only)
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const prisma = usePrisma();

  const permissions = await prisma.permission.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });

  // Group by category
  const grouped = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, typeof permissions>
  );

  return { permissions, grouped };
});
