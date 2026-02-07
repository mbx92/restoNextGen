/**
 * Platform Admin API - Delete feature
 * DELETE /api/platform/features/[id]
 *
 * Note: This will cascade delete all PlanFeature and TenantFeatureOverride records
 */
export default defineEventHandler(async (event) => {
  // TODO: Add platform admin auth check
  // const platformAdmin = await getPlatformAdmin(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Feature ID is required",
    });
  }

  const feature = await prisma.feature.delete({
    where: { id },
  });

  return feature;
});
