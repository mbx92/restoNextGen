/**
 * Platform Admin API - List all features
 * GET /api/platform/features
 */
export default defineEventHandler(async (event) => {
  // TODO: Add platform admin auth check
  // const platformAdmin = await getPlatformAdmin(event);

  const features = await prisma.feature.findMany({
    orderBy: [{ sortOrder: "asc" }],
    include: {
      category: true,
      _count: {
        select: {
          planFeatures: true,
          tenantOverrides: true,
        },
      },
    },
  });

  return features;
});
