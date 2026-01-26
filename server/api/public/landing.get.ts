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

  // Get all landing page data in one response
  const [heroes, featuredItems, reviews, businessInfo] = await Promise.all([
    prisma.landingHero.findMany({
      where: { tenantId, isActive: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.menuItem.findMany({
      where: {
        tenantId,
        isFeatured: true,
        isAvailable: true,
      },
      include: {
        category: true,
      },
      orderBy: { sortOrder: "asc" },
    }),
    prisma.review.findMany({
      where: {
        tenantId,
        isPublished: true,
        isFeatured: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.businessInfo.findUnique({
      where: { tenantId },
    }),
  ]);

  return {
    heroes,
    featuredItems,
    reviews,
    businessInfo,
    // Keep backward compatibility
    restaurantInfo: businessInfo
      ? {
          ...businessInfo,
          openingHours:
            (businessInfo.metadata as { openingHours?: string })?.openingHours ||
            "",
        }
      : null,
  };
});
