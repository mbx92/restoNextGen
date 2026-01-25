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
  const userId = getRouterParam(event, "userId");

  if (!tenantId || !userId) {
    throw createError({
      statusCode: 400,
      message: "Tenant ID and User ID are required",
    });
  }

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
      message: "User not found for this tenant",
    });
  }

  await prisma.adminUser.delete({
    where: { id: userId },
  });

  return { success: true };
});
