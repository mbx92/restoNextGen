import type { H3Event } from "h3";

/**
 * Get tenantId from the current session.
 * Throws 401 if no session or tenantId.
 */
export async function getTenantId(event: H3Event): Promise<string> {
  const session = await getUserSession(event);

  if (!session?.user?.tenantId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: No tenant context",
    });
  }

  return session.user.tenantId;
}

/**
 * Get full tenant context from session.
 */
export async function getTenantContext(event: H3Event) {
  const session = await getUserSession(event);

  if (!session?.user?.tenantId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized: No tenant context",
    });
  }

  return {
    tenantId: session.user.tenantId,
    tenantSlug: session.user.tenantSlug,
    businessType: session.user.businessType,
    userId: session.user.id,
    userEmail: session.user.email,
    userName: session.user.name,
  };
}
