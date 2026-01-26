import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * GET /api/platform/tenants/:id/users
 * List all admin users for a tenant
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);

  const tenantId = getRouterParam(event, "id");
  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required",
    });
  }

  const prisma = usePrisma();

  const users = await prisma.adminUser.findMany({
    where: { tenantId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return { users };
});
