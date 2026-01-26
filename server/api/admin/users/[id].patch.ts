import { z } from "zod";
import { hash } from "bcrypt";
import { requirePermission } from "~/server/utils/auth-helpers";

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  phoneNumber: z.string().optional(),
  role: z
    .enum(["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN", "CUSTOMER"])
    .optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(), // Optional password change
});

/**
 * PATCH /api/admin/users/[id]
 * Update an existing user
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

  // Parse and validate request body
  const body = await readBody(event);
  const data = updateUserSchema.parse(body);

  // Prepare update data
  const updateData: any = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phoneNumber !== undefined) updateData.phoneNumber = data.phoneNumber;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  // Hash new password if provided
  if (data.password) {
    updateData.passwordHash = await hash(data.password, 10);
  }

  // Update user
  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      phoneNumber: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return {
    success: true,
    user,
  };
});
