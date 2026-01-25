export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const prisma = usePrisma();

  const info = await prisma.businessInfo.findUnique({
    where: { tenantId },
  });

  if (!info) {
    return null;
  }

  // Return with backward compatibility for restaurant-specific fields
  const metadata = (info.metadata as { openingHours?: string }) || {};

  return {
    ...info,
    openingHours: metadata.openingHours || "",
  };
});
