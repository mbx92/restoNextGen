import { prisma } from "~/server/db/prisma";

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  // Check if user is platform admin
  if (!session.user?.isPlatformAdmin) {
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

  const body = await readBody(event);

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data: {
      isActive: body.isActive,
    },
  });

  return tenant;
});
