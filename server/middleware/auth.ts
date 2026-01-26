export default defineEventHandler(async (event) => {
  // Skip auth check for non-admin routes
  const path = event.path;
  if (!path.startsWith("/api/admin")) {
    return;
  }

  // Allow login, session, and logout endpoints (no auth required for login/session, logout needs session but no role check)
  if (
    path === "/api/admin/auth/login" ||
    path === "/api/admin/auth/session" ||
    path === "/api/admin/auth/logout" ||
    path === "/api/auth/login"
  ) {
    return;
  }

  // Check session for all other admin API routes
  const session = await getUserSession(event);
  if (!session?.user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - Please login",
    });
  }

  // Check if user has staff role (not just customer)
  const userRole = session.user.role;
  const staffRoles = ["OWNER", "MANAGER", "CASHIER", "WAITER", "KITCHEN"];

  if (!staffRoles.includes(userRole)) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden - Staff access required",
    });
  }
});
