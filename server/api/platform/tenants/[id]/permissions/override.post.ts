import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * POST /api/platform/tenants/:id/permissions/override
 * Override permission for a tenant and specific role
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

  const body = await readBody(event);
  const { permissionId, roleCode, isGranted, note } = body;

  if (!permissionId || !roleCode || typeof isGranted !== "boolean") {
    throw createError({
      statusCode: 400,
      statusMessage:
        "Permission ID, role code, and isGranted flag are required",
    });
  }

  const prisma = usePrisma();

  // Check tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found",
    });
  }

  // Check permission exists
  const permission = await prisma.permission.findUnique({
    where: { id: permissionId },
  });

  if (!permission) {
    throw createError({
      statusCode: 404,
      statusMessage: "Permission not found",
    });
  }

  // Create or update override
  const override = await prisma.tenantPermissionOverride.upsert({
    where: {
      tenantId_permissionId_roleCode: {
        tenantId,
        permissionId,
        roleCode,
      },
    },
    create: {
      tenantId,
      permissionId,
      roleCode,
      isGranted,
      note: note || `Manual override by platform admin`,
    },
    update: {
      isGranted,
      note: note || `Updated by platform admin`,
    },
  });

  return {
    success: true,
    override,
  };
});
