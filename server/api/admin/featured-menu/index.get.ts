import { hasFeature } from "~/server/utils/feature-gating";

export default defineEventHandler(async (event) => {
  // Check if CMS feature is enabled
  if (!(await hasFeature(event, "CONTENT_MANAGEMENT_SERVICE"))) {
    throw createError({
      statusCode: 403,
      statusMessage: "Content Management Service is not available in your plan. Please upgrade to access this feature.",
    });
  }

  const tenantId = await getTenantId(event);
  const prisma = usePrisma();

  // Use MenuItem with isFeatured instead of deprecated FeaturedMenuItem
  const items = await prisma.menuItem.findMany({
    where: { tenantId, isFeatured: true },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return items;
});
