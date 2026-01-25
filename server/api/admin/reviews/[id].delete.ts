export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Review ID required" });
  }

  const prisma = usePrisma();

  await prisma.review.delete({
    where: { id },
  });

  return { success: true };
});
