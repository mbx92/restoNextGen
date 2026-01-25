export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Review ID required" });
  }

  const prisma = usePrisma();

  // Verify review belongs to tenant
  const review = await prisma.review.findFirst({
    where: { id, tenantId },
  });

  if (!review) {
    throw createError({ statusCode: 404, message: "Review not found" });
  }

  await prisma.review.delete({
    where: { id },
  });

  return { success: true };
});
