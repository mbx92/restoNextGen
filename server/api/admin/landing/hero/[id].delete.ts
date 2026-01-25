export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Hero ID is required",
    });
  }

  const prisma = usePrisma();
  await prisma.landingHero.delete({
    where: { id },
  });

  return { success: true };
});
