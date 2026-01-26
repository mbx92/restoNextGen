import prisma from "~/server/db/prisma";

export default defineEventHandler(async () => {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    include: {
      businessInfo: true,
      themeConfig: true,
    },
    orderBy: { name: "asc" },
  });

  return tenants.map((tenant) => ({
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    businessType: tenant.businessType,
    businessInfo: tenant.businessInfo
      ? {
          name: tenant.businessInfo.name,
          description: tenant.businessInfo.description,
        }
      : null,
    themeConfig: tenant.themeConfig
      ? {
          primaryColor: tenant.themeConfig.primaryColor,
          secondaryColor: tenant.themeConfig.secondaryColor,
        }
      : null,
  }));
});
