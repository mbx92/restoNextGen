import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * DELETE /api/platform/tenants/:id/users/:userId
 * Delete an admin user from a tenant
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);

  const tenantId = getRouterParam(event, "id");
  const userId = getRouterParam(event, "userId");

  if (!tenantId || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID and User ID are required",
    });
  }

  const prisma = usePrisma();

  // Verify user belongs to this tenant
  const user = await prisma.adminUser.findFirst({
    where: {
      id: userId,
      tenantId,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found for this tenant",
    });
  }

  // Prevent deleting the only OWNER
  if (user.role === "OWNER") {
    const ownerCount = await prisma.adminUser.count({
      where: {
        tenantId,
        role: "OWNER",
        isActive: true,
      },
    });

    if (ownerCount <= 1) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cannot delete the only OWNER of this tenant",
      });
    }
  }

  await prisma.adminUser.delete({
    where: { id: userId },
  });

  return { success: true };
});
