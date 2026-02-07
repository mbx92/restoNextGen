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
  const body = await readBody(event);

  // Deactivate all existing heroes for this tenant
  await prisma.landingHero.updateMany({
    where: { tenantId, isActive: true },
    data: { isActive: false },
  });

  // Create new hero
  const hero = await prisma.landingHero.create({
    data: {
      tenantId,
      campaignId: body.campaignId || null,
      title: body.title,
      subtitle: body.subtitle,
      description: body.description,
      ctaText: body.ctaText,
      ctaLink: body.ctaLink,
      promoText: body.promoText,
      imageUrl: body.imageUrl,
      isActive: true,
    },
  });

  return hero;
});
