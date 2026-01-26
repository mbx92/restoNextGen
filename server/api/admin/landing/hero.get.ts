export default defineEventHandler(async (event) => {
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
