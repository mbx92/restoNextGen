import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * GET /api/platform/tenants/:id/permissions
 * Get permissions for a tenant
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

  // Get tenant with business type
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      businessType: true,
    },
  });

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found",
    });
  }

  // Get business type default permissions
  const businessTypePermissions = await prisma.businessTypePermission.findMany({
    where: {
      businessType: tenant.businessType,
      isEnabled: true,
    },
    include: {
      permission: true,
    },
  });

  // Get tenant-specific overrides
  const tenantOverrides = await prisma.tenantPermissionOverride.findMany({
    where: { tenantId },
    include: {
      permission: true,
    },
  });

  // Build permission list with override status
  const overrideMap = new Map(
    tenantOverrides.map((o) => [o.permissionId, o.isGranted]),
  );

  const permissions = businessTypePermissions.map((btp) => {
    const hasOverride = overrideMap.has(btp.permissionId);
    const finalEnabled = hasOverride
      ? overrideMap.get(btp.permissionId)!
      : btp.isEnabled;

    return {
      id: btp.permission.id,
      code: btp.permission.code,
      name: btp.permission.name,
      description: btp.permission.description,
      category: btp.permission.category,
      isEnabled: finalEnabled,
      isOverridden: hasOverride,
      defaultEnabled: btp.isEnabled,
    };
  });

  // Get business type roles
  const businessTypeRoles = await prisma.businessTypeRole.findMany({
    where: {
      businessType: tenant.businessType,
      isEnabled: true,
    },
    include: {
      role: true,
    },
  });

  const roles = businessTypeRoles.map((btr) => ({
    id: btr.role.id,
    code: btr.role.code,
    name: btr.role.name,
    description: btr.role.description,
    hierarchy: btr.role.hierarchy,
  }));

  // Group permissions by category
  const grouped = permissions.reduce(
    (acc, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    },
    {} as Record<string, typeof permissions>,
  );

  return {
    tenant: {
      id: tenant.id,
      name: tenant.name,
      businessType: tenant.businessType,
    },
    roles,
    permissions,
    grouped,
    summary: {
      totalPermissions: permissions.length,
      enabledPermissions: permissions.filter((p) => p.isEnabled).length,
      overriddenPermissions: permissions.filter((p) => p.isOverridden).length,
      availableRoles: roles.length,
    },
  };
});
