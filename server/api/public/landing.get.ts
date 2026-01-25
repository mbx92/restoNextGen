export default defineEventHandler(async () => {
  const prisma = usePrisma();

  // Get all landing page data in one response
  const [heroes, featuredItems, reviews, restaurantInfo] = await Promise.all([
    prisma.landingHero.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.menuItem.findMany({
      where: { 
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
        isPublished: true,
        isFeatured: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.restaurantInfo.findFirst(),
  ]);

  return {
    heroes,
    featuredItems,
    reviews,
    restaurantInfo,
  };
});
