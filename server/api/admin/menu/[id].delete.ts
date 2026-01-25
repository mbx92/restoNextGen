export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Menu item ID required" });
  }

  const prisma = usePrisma();

  await prisma.menuItem.delete({
    where: { id },
  });

  return { success: true };
});
