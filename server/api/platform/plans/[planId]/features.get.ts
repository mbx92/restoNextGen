/**
 * Platform Admin API - Get plan features
 * GET /api/platform/plans/[planId]/features
 */
export default defineEventHandler(async (event) => {
  // TODO: Add platform admin auth check
  // const platformAdmin = await getPlatformAdmin(event);

  const planId = getRouterParam(event, "planId");
  if (!planId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Plan ID is required",
    });
  }

  const planFeatures = await prisma.planFeature.findMany({
    where: { planId },
    include: {
      feature: {
        include: {
          category: true,
        },
      },
    },
  });

  return planFeatures;
});
