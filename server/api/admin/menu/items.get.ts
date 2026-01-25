export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const prisma = usePrisma();

  const items = await prisma.menuItem.findMany({
    where: { tenantId },
    include: {
      category: true,
    },
    orderBy: { sortOrder: "asc" },
  });

  return items;
});
