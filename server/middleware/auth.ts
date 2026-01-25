export default defineEventHandler(async (event) => {
  // Skip auth check for non-admin routes
  const path = event.path;
  if (!path.startsWith("/api/admin")) {
    return;
  }

  // Allow login endpoint
  if (path === "/api/admin/auth/login") {
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
});
