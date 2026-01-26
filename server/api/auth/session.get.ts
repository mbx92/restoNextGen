/**
 * GET /api/auth/session
 * Get current user session
 */
export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user) {
    return {
      user: null,
    };
  }

  return session;
});
