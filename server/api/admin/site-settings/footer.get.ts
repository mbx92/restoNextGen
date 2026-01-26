import prisma from "~/server/db/prisma";

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);

  const footerSettings = await prisma.siteSettings.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key: "footer",
      },
    },
  });

  return footerSettings;
});
