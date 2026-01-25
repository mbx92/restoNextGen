export default defineEventHandler(async () => {
  const prisma = usePrisma();

  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: {
        select: { items: true },
      },
    },
  });

  return categories;
});
