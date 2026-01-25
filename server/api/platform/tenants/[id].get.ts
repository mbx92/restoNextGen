import { prisma } from "~/server/db/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  // Check if user is platform admin
  if (!session.isPlatformAdmin) {
    throw createError({
      statusCode: 403,
      message: "Forbidden: Platform admin access required",
    });
  }

  const tenantId = getRouterParam(event, "id");

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      message: "Tenant ID is required",
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
      message: "Tenant not found",
    });
  }

  return tenant;
});
