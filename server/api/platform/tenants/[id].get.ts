import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * GET /api/platform/tenants/:id
 * Get a tenant by ID
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const prisma = usePrisma();
  const tenantId = getRouterParam(event, "id");

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required",
    });
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: {
      subscription: true,
      adminUsers: {
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found",
    });
  }

  return tenant;
});
