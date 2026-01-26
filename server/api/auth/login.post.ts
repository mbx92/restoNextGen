import { z } from "zod";
import { compare } from "bcrypt";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().optional(), // Optional: auto-detect or use default
});

/**
 * POST /api/auth/login
 * Unified login for both AdminUser (legacy) and User (RBAC)
 */
export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email, password, tenantSlug } = loginSchema.parse(body);

  const prisma = usePrisma();

  // Try to find tenant
  let tenant = null;
  if (tenantSlug) {
    tenant = await prisma.tenant.findUnique({
      where: { slug: tenantSlug },
    });
    if (!tenant) {
      throw createError({
        statusCode: 404,
        statusMessage: "Tenant not found",
      });
    }
  } else {
    // If no tenantSlug provided, try to find tenant by email
    // First check AdminUser
    const adminUser = await prisma.adminUser.findFirst({
      where: { email, isActive: true },
      include: { tenant: true },
    });

    if (adminUser) {
      tenant = adminUser.tenant;
    } else {
      // Then check User
      const user = await prisma.user.findFirst({
        where: { email, isActive: true },
        include: { tenant: true },
      });

      if (user) {
        tenant = user.tenant;
      } else {
        // Fallback: use first active tenant
        tenant = await prisma.tenant.findFirst({
          where: { isActive: true },
        });
      }
    }
  }

  if (!tenant) {
    throw createError({
      statusCode: 500,
      statusMessage: "No active tenant found",
    });
  }

  // Try User model first (new RBAC system)
  const user = await prisma.user.findFirst({
    where: {
      email,
      tenantId: tenant.id,
      isActive: true,
    },
    include: {
      tenant: true,
    },
  });

  if (user) {
    // Verify password
    if (!user.passwordHash) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid email or password",
      });
    }

    const isPasswordValid = await compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid email or password",
      });
    }

    // Create session for User
    await setUserSession(event, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug: user.tenant?.slug,
        businessType: user.tenant?.businessType,
      },
      loggedInAt: new Date().toISOString(),
    });

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenantSlug: user.tenant?.slug,
        businessType: user.tenant?.businessType,
      },
    };
  }

  // Fallback: Try AdminUser model (legacy)
  const adminUser = await prisma.adminUser.findFirst({
    where: {
      email,
      tenantId: tenant.id,
      isActive: true,
    },
    include: {
      tenant: true,
    },
  });

  if (!adminUser) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  const isPasswordValid = await compare(password, adminUser.passwordHash);
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: "Invalid email or password",
    });
  }

  // Create session for AdminUser (treat as OWNER role)
  await setUserSession(event, {
    user: {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: "OWNER", // Default AdminUser to OWNER role
      tenantId: adminUser.tenantId,
      tenantSlug: adminUser.tenant?.slug,
      businessType: adminUser.tenant?.businessType,
    },
    loggedInAt: new Date().toISOString(),
  });

  return {
    success: true,
    user: {
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: "OWNER",
      tenantId: adminUser.tenantId,
      tenantSlug: adminUser.tenant?.slug,
      businessType: adminUser.tenant?.businessType,
    },
  };
});
