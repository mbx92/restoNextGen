export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Featured menu ID required",
    });
  }

  const prisma = usePrisma();

  await prisma.featuredMenuItem.delete({
    where: { id },
  });

  return { success: true };
});
