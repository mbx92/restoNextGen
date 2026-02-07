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
  const heroes = await prisma.landingHero.findMany({
    where: { tenantId },
    include: {
      campaign: {
        select: {
          id: true,
          name: true,
          type: true,
          discount: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return heroes;
});
