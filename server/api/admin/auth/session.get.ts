export default defineEventHandler(async (event) => {
  const session = await getUserSession(event);
  
  if (!session?.user) {
    return { user: null };
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      tenantId: session.user.tenantId,
      tenantSlug: session.user.tenantSlug,
      businessType: session.user.businessType,
    },
  };
});
