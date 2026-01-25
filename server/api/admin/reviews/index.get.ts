export default defineEventHandler(async () => {
  const prisma = usePrisma();

  const reviews = await prisma.review.findMany({
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  return reviews;
});
