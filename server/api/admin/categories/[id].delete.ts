export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Category ID required" });
  }

  const prisma = usePrisma();

  // Check if category has items
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { items: true } } },
  });

  if (!category) {
    throw createError({ statusCode: 404, message: "Category not found" });
  }

  if (category._count.items > 0) {
    throw createError({
      statusCode: 400,
      message: "Cannot delete category with menu items",
    });
  }

  await prisma.category.delete({
    where: { id },
  });

  return { success: true };
});
