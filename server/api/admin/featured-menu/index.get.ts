export default defineEventHandler(async () => {
  const prisma = usePrisma();
  const items = await prisma.featuredMenuItem.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return items;
});
