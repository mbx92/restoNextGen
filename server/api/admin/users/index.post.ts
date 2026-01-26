import { z } from "zod";
import { hash } from "bcrypt";
import { requirePermission } from "~/server/utils/auth-helpers";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phoneNumber: z.string().optional(),
  role: z.enum([
    "OWNER",
    "MANAGER",
    "CASHIER",
    "WAITER",
    "KITCHEN",
    "CUSTOMER",
  ]),
  password: z.string().min(6),
});

/**
 * POST /api/admin/users
 * Create a new user for current tenant
 */
export default defineEventHandler(async (event) => {
  // Require permission to manage users
  const session = await requirePermission(event, "MANAGE_USERS");
  const tenantId = session.user.tenantId;

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "No tenant associated with user session",
    });
  }

  const prisma = usePrisma();

  // Parse and validate request body
  const body = await readBody(event);
  const data = createUserSchema.parse(body);

  // Verify tenant exists
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid tenant ID in session",
    });
  }

  // Check if email already exists for this tenant
  const existing = await prisma.user.findUnique({
    where: {
      tenantId_email: {
        tenantId,
        email: data.email,
      },
    },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: "User with this email already exists",
    });
  }

  // Hash password
  const passwordHash = await hash(data.password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      tenantId,
      email: data.email,
      passwordHash,
      name: data.name,
      phoneNumber: data.phoneNumber,
      role: data.role,
      isActive: true,
    },
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
