import type { H3Event } from "h3";

export default defineEventHandler(async (event: H3Event) => {
  const tenantId = await getTenantId(event);

  const prisma = usePrisma();

  const themeConfig = await prisma.themeConfig.findUnique({
    where: { tenantId },
  });

  if (!themeConfig) {
    throw createError({
      statusCode: 404,
      message: "Theme config not found",
    });
  }

  return themeConfig;
});
