import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * DELETE /api/platform/tenants/:id/permissions/override/:permissionId
 * Remove permission override for a tenant (revert to business type default)
 * Query param: roleCode (required)
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);

  const tenantId = getRouterParam(event, "id");
  const permissionId = getRouterParam(event, "permissionId");
  const query = getQuery(event);
  const roleCode = query.roleCode as string;

  if (!tenantId || !permissionId || !roleCode) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID, Permission ID, and roleCode are required",
    });
  }

  const prisma = usePrisma();

  // Check if override exists
  const override = await prisma.tenantPermissionOverride.findUnique({
    where: {
      tenantId_permissionId_roleCode: {
        tenantId,
        permissionId,
        roleCode,
      },
    },
  });

  if (!override) {
    throw createError({
      statusCode: 404,
      statusMessage: "Override not found",
    });
  }

  // Delete override
  await prisma.tenantPermissionOverride.delete({
    where: {
      tenantId_permissionId_roleCode: {
        tenantId,
        permissionId,
        roleCode,
      },
    },
  });

  return {
    success: true,
    message: "Permission override removed - reverted to business type default",
  };
});
