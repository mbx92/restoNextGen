import { requirePermission } from "~/server/utils/auth-helpers";

/**
 * GET /api/admin/users
 * List all users for current tenant with optional role filter
 */
export default defineEventHandler(async (event) => {
  // Require permission to view users
  const session = await requirePermission(event, "VIEW_USERS");
  const tenantId = session.user.tenantId!;

  // Get query params
  const query = getQuery(event);
  const role = query.role as string | undefined;

  // Build where clause
  const where: any = { tenantId };
  if (role) {
    where.role = role;
  }

  // Fetch users
  const users = await prisma.user.findMany({
    where,
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
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });

  return {
    users,
    total: users.length,
  };
});
