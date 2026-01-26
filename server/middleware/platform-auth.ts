export default defineEventHandler(async (event) => {
  const path = event.path;

  // Skip auth check for login endpoint
  if (path === "/api/platform/auth/login") {
    return;
  }

  // Check all platform API routes
  if (path.startsWith("/api/platform")) {
    const session = await getUserSession(event);

    if (!session?.platformAdmin) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized: Please login as platform admin",
      });
    }
  }
});
