export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const prisma = usePrisma();

  // Use MenuItem with isFeatured instead of deprecated FeaturedMenuItem
  const items = await prisma.menuItem.findMany({
    where: { tenantId, isFeatured: true },
    include: { category: true },
    orderBy: { sortOrder: "asc" },
  });

  return items;
});
