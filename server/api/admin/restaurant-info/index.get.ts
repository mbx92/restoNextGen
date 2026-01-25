export default defineEventHandler(async () => {
  const prisma = usePrisma();

  const info = await prisma.restaurantInfo.findFirst();

  return info;
});
