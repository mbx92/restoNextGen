export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const body = await readBody(event);

  const prisma = usePrisma();

  const siteSettings = await prisma.siteSettings.upsert({
    where: {
      tenantId_key: {
        tenantId,
        key: "footer",
      },
    },
    update: {
      copyrightText: body.copyrightText || null,
      footerLinks: body.footerLinks || null,
    },
    create: {
      tenantId,
      key: "footer",
      copyrightText: body.copyrightText || null,
      footerLinks: body.footerLinks || null,
    },
  });

  return siteSettings;
});
