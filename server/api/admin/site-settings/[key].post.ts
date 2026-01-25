import { z } from "zod";

const settingsSchema = z.object({
  logoUrl: z.string().optional(),
  logoText: z.string().optional(),
  facebookUrl: z.string().url().optional().or(z.literal("")),
  instagramUrl: z.string().url().optional().or(z.literal("")),
  twitterUrl: z.string().url().optional().or(z.literal("")),
  copyrightText: z.string().optional(),
  footerLinks: z
    .array(
      z.object({
        label: z.string(),
        url: z.string(),
      }),
    )
    .optional(),
});

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const key = getRouterParam(event, "key");

  if (!key || (key !== "header" && key !== "footer")) {
    throw createError({
      statusCode: 400,
      message: "Invalid settings key. Must be 'header' or 'footer'",
    });
  }

  const body = await readBody(event);
  const data = settingsSchema.parse(body);

  const prisma = usePrisma();

  const settings = await prisma.siteSettings.upsert({
    where: { tenantId_key: { tenantId, key } },
    update: data,
    create: {
      tenantId,
      key,
      ...data,
    },
  });

  return settings;
});
