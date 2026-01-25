import { getTenantContext } from "~/server/utils/tenant";

export default defineEventHandler(async (event) => {
  const tenantContext = await getTenantContext(event);

  if (!tenantContext) {
    // Return default theme
    return {
      primaryColor: "#16a34a",
      secondaryColor: "#ca8a04",
      fontFamily: "Inter",
      layoutVariant: "default",
    };
  }

  const prisma = usePrisma();

  const themeConfig = await prisma.themeConfig.findUnique({
    where: { tenantId: tenantContext.id },
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
