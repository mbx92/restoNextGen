import type { H3Event } from "h3";

/**
 * Require platform admin authentication
 */
export async function requirePlatformAdmin(event: H3Event): Promise<void> {
  const session = await getUserSession(event);

  if (!session?.user?.isPlatformAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden: Platform admin access required",
    });
  }
}
