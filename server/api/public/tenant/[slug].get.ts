import prisma from "~/server/db/prisma";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");

  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant slug is required",
    });
  }

  // Find tenant by slug
  const tenant = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      businessInfo: true,
      themeConfig: true,
    },
  });

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: `Tenant "${slug}" not found`,
    });
  }

  if (!tenant.isActive) {
    throw createError({
      statusCode: 403,
      statusMessage: "Tenant is not active",
    });
  }

  return {
    tenant: {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      businessType: tenant.businessType,
    },
    businessInfo: tenant.businessInfo,
    themeConfig: tenant.themeConfig,
  };
});
