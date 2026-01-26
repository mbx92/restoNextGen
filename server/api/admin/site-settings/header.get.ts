import prisma from "~/server/db/prisma";

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);

  const headerSettings = await prisma.siteSettings.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key: "header",
      },
    },
  });

  return headerSettings;
});
