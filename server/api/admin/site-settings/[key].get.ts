export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const key = getRouterParam(event, "key");

  if (!key || (key !== "header" && key !== "footer")) {
    throw createError({
      statusCode: 400,
      message: "Invalid settings key. Must be 'header' or 'footer'",
    });
  }

  const prisma = usePrisma();

  const settings = await prisma.siteSettings.findUnique({
    where: { tenantId_key: { tenantId, key } },
  });

  if (!settings) {
    throw createError({
      statusCode: 404,
      message: `Settings for '${key}' not found`,
    });
  }

  return settings;
});
