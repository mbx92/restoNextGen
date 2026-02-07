import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * GET /api/platform/rbac/business-types/:type
 * Get RBAC configuration for a specific business type
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const businessType = getRouterParam(event, "type")?.toUpperCase();

  if (!businessType) {
    throw createError({
      statusCode: 400,
      message: "Business type is required",
    });
  }

  const prisma = usePrisma();

  // Get enabled roles for this business type
  const businessTypeRoles = await prisma.businessTypeRole.findMany({
    where: { businessType },
    include: {
      role: true,
    },
  });

  // Get enabled permissions for this business type
  const businessTypePermissions =
    await prisma.businessTypePermission.findMany({
      where: { businessType },
      include: {
        permission: true,
      },
    });

  return {
    businessType,
    roles: businessTypeRoles,
    permissions: businessTypePermissions,
  };
});
