export default defineEventHandler(async () => {
  const prisma = usePrisma();
  const heroes = await prisma.landingHero.findMany({
    orderBy: { createdAt: "desc" },
  });
  return heroes;
});
