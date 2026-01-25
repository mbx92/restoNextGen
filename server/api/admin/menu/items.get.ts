export default defineEventHandler(async () => {
  const prisma = usePrisma();

  const items = await prisma.menuItem.findMany({
    include: {
      category: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  return items;
});
