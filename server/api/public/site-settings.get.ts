export default defineEventHandler(async (event) => {
  const prisma = usePrisma();

  // For now, get the default tenant (demo-restaurant)
  // TODO: Resolve tenant from subdomain/header in production
  const tenantSlug = getHeader(event, "x-tenant-slug") || "demo-restaurant";

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug, isActive: true },
  });

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found",
    });
  }

  const tenantId = tenant.id;

  const [header, footer] = await Promise.all([
    prisma.siteSettings.findUnique({
      where: { tenantId_key: { tenantId, key: "header" } },
    }),
    prisma.siteSettings.findUnique({
      where: { tenantId_key: { tenantId, key: "footer" } },
    }),
  ]);

  return {
    header,
    footer,
  };
});
