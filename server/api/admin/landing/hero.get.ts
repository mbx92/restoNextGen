export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const prisma = usePrisma();
  const heroes = await prisma.landingHero.findMany({
    where: { tenantId },
    orderBy: { createdAt: "desc" },
  });
  return heroes;
});
