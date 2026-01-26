export default defineEventHandler(async (event) => {
  const prisma = usePrisma();

  // Get tenant from query parameter, header, or default
  const query = getQuery(event);
  const tenantSlug = 
    (query.tenant as string) || 
    getHeader(event, "x-tenant-slug") || 
    "demo-restaurant";

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
