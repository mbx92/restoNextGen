export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Category ID required" });
  }

  const prisma = usePrisma();

  // Check if category exists and belongs to tenant
  const category = await prisma.category.findFirst({
    where: { id, tenantId },
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
