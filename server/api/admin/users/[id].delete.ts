import { requirePermission } from "~/server/utils/auth-helpers";

/**
 * DELETE /api/admin/users/[id]
 * Delete a user (soft delete by setting isActive = false)
 */
export default defineEventHandler(async (event) => {
  // Require permission to manage users
  const session = await requirePermission(event, "MANAGE_USERS");
  const tenantId = session.user.tenantId!;

  // Get user ID from route params
  const userId = getRouterParam(event, "id");
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "User ID is required",
    });
  }

  // Prevent deleting self
  if (userId === session.user.id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Cannot delete your own account",
    });
  }

  // Check if user exists and belongs to tenant
  const existingUser = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId,
    },
  });

  if (!existingUser) {
    throw createError({
      statusCode: 404,
      statusMessage: "User not found",
    });
  }

  // Soft delete by setting isActive = false
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });

  return {
    success: true,
    message: "User deactivated successfully",
  };
});
