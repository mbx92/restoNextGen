export default defineEventHandler(async (event) => {
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
