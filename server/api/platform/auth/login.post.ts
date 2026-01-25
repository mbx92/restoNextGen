import { z } from "zod";
import { compare } from "bcrypt";
import type { H3Event } from "h3";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default defineEventHandler(async (event: H3Event) => {
  const body = await readBody(event);
  const { email, password } = loginSchema.parse(body);

  const prisma = usePrisma();

  // Find platform admin
  const admin = await prisma.platformAdmin.findUnique({
    where: { email },
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

  // Set session for platform admin
  await setUserSession(event, {
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
      isPlatformAdmin: true,
    },
  });

  return {
    user: {
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: admin.role,
    },
  };
});
