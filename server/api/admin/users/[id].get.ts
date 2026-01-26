import { requirePermission } from "~/server/utils/auth-helpers";

/**
 * GET /api/admin/users/[id]
 * Get single user details
 */
export default defineEventHandler(async (event) => {
  // Require permission to view users
  const session = await requirePermission(event, "VIEW_USERS");
  const tenantId = session.user.tenantId!;

  // Get user ID from route params
  const userId = getRouterParam(event, "id");
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  // Fetch user
  const user = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      phoneNumber: true,
      role: true,
      isActive: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  return {
    user,
  };
});
