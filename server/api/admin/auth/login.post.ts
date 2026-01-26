import { z } from "zod";
import { compare } from "bcrypt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password } = loginSchema.parse(body);

  const prisma = usePrisma();

  // Find admin user with tenant info
  const admin = await prisma.adminUser.findFirst({
    where: { email },
    include: {
      tenant: true,
    },
  });

  if (!admin || !admin.isActive) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  // Verify password
  const isValid = await compare(password, admin.passwordHash);
  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid credentials",
    });
  }

  // Set session with tenant context
  await setUserSession(event, {
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      tenantId: admin.tenantId,
      tenantSlug: admin.tenant.slug,
      businessType: admin.tenant.businessType,
    },
  });

  return {
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      tenantId: admin.tenantId,
      tenantSlug: admin.tenant.slug,
      businessType: admin.tenant.businessType,
    },
  };
});
