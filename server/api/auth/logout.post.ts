/**
 * POST /api/auth/logout
 * User logout endpoint
 */
export default defineEventHandler(async (event) => {
  await clearUserSession(event);

  return {
    success: true,
    message: "Logged out successfully",
  };
});
