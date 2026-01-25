export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const prisma = usePrisma();

  const reviews = await prisma.review.findMany({
    where: { tenantId },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return reviews;
});
