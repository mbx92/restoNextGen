export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);

  if (!session?.user || !session.user.isPlatformAdmin) {
    return { user: null };
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role: session.user.role,
    },
  };
});
