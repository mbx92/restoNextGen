export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Menu item ID required" });
  }

  const prisma = usePrisma();

  // Verify menu item belongs to tenant
  const existing = await prisma.menuItem.findFirst({
    where: { id, tenantId },
  });

  if (!existing) {
    throw createError({ statusCode: 404, message: "Menu item not found" });
  }

  await prisma.menuItem.delete({
    where: { id },
  });

  return { success: true };
});
