export default defineEventHandler(async (event) => {
  // Skip auth check for non-admin routes
  const path = event.path;
  if (!path.startsWith("/api/admin")) {
    return;
  }

  // Allow login, session, and logout endpoints (no auth required for login/session)
  if (
    path === "/api/admin/auth/login" ||
    path === "/api/admin/auth/session" ||
    path === "/api/admin/auth/logout"
  ) {
    return;
  }

  // Check session for all other admin API routes
  const session = await getUserSession(event);
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - Please login as tenant admin",
    });
  }

  // Verify this is a tenant admin (has tenantId)
  if (!session.user.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden - Tenant admin access required",
    });
  }
});
