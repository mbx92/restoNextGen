export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const body = await readBody(event);

  const prisma = usePrisma();

  const headerSettings = await prisma.siteSettings.upsert({
    where: {
      tenantId_key: {
        tenantId,
        key: "header",
      },
    },
    update: {
      logoText: body.logoText || null,
      logoUrl: body.logoUrl || null,
      facebookUrl: body.facebookUrl || null,
      instagramUrl: body.instagramUrl || null,
      twitterUrl: body.twitterUrl || null,
    },
    create: {
      tenantId,
      key: "header",
      logoText: body.logoText || null,
      logoUrl: body.logoUrl || null,
      facebookUrl: body.facebookUrl || null,
      instagramUrl: body.instagramUrl || null,
      twitterUrl: body.twitterUrl || null,
    },
  });

  return headerSettings;
});
