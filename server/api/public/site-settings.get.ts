export default defineEventHandler(async () => {
  const prisma = usePrisma();

  const [header, footer] = await Promise.all([
    prisma.siteSettings.findUnique({ where: { key: "header" } }),
    prisma.siteSettings.findUnique({ where: { key: "footer" } }),
  ]);

  return {
    header,
    footer,
  };
});
