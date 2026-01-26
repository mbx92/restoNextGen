export default defineEventHandler(async (event) => {
  const prisma = usePrisma();

  // Try to get tenant from session (optional for public routes)
  const session = await getUserSession(event);
  const tenantId = session?.user?.tenantId;

  // If no tenant context, return default theme
  if (!tenantId) {
    return {
      primaryColor: "#16a34a",
      secondaryColor: "#ca8a04",
      fontFamily: "Inter",
      layoutVariant: "default",
    };
  }

  const themeConfig = await prisma.themeConfig.findUnique({
    where: { tenantId },
  });

  if (!themeConfig) {
    // Return default theme if not configured
    return {
      primaryColor: "#16a34a",
      secondaryColor: "#ca8a04",
      fontFamily: "Inter",
      layoutVariant: "default",
    };
  }

  return {
    primaryColor: themeConfig.primaryColor,
    secondaryColor: themeConfig.secondaryColor,
    fontFamily: themeConfig.fontFamily,
    layoutVariant: themeConfig.layoutVariant,
    customCss: themeConfig.customCss,
  };
});
