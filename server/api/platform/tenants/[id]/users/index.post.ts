import { hash } from "ohash";
import { usePrisma } from "~/server/utils/prisma";

const prisma = usePrisma();

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

  const body = await readBody(event);

  // Validate required fields
  if (!body.email || !body.password) {
    throw createError({
      statusCode: 400,
      message: "Email and password are required",
    });
  }

  // Check if user already exists
  const existingUser = await prisma.adminUser.findFirst({
    where: {
      email: body.email,
      tenantId,
    },
  });

  if (existingUser) {
    throw createError({
      statusCode: 400,
      message: "User with this email already exists for this tenant",
    });
  }

  // Hash password
  const passwordHash = hash(body.password);

  // Create admin user
  const adminUser = await prisma.adminUser.create({
    data: {
      email: body.email,
      name: body.name || null,
      passwordHash,
      tenantId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  return adminUser;
});
