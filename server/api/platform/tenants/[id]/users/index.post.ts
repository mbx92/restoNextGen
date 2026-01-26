import { hash } from "bcrypt";
import { requirePlatformAdmin } from "~/server/utils/platform-auth";

/**
 * POST /api/platform/tenants/:id/users
 * Create a new admin user for a tenant
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
  const { email, name, password, role } = body;

  // Validation
  if (!email || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email and password are required",
    });
  }

  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: "Password must be at least 8 characters",
    });
  }

  const validRoles = [
    "OWNER",
    "MANAGER",
    "STAFF",
    "CASHIER",
    "WAITER",
    "KITCHEN",
  ];
  if (role && !validRoles.includes(role)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
    });
  }

  const prisma = usePrisma();

  // Check if tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found",
    });
  }

  // Check if user with same email already exists in this tenant
  const existingUser = await prisma.adminUser.findFirst({
    where: {
      email,
      tenantId,
    },
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "User with this email already exists in this tenant",
    });
  }

  // Hash password
  const passwordHash = await hash(password, 10);

  // Create user
  const adminUser = await prisma.adminUser.create({
    data: {
      email,
      name: name || email,
      passwordHash,
      role: role || "STAFF",
      tenantId,
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  return {
    success: true,
    user: adminUser,
  };
});
