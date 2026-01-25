import { z } from "zod";
import type { H3Event } from "h3";

const themeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  fontFamily: z.string().optional(),
  layoutVariant: z.enum(["default", "minimal", "bold"]).optional(),
  customCss: z.string().optional(),
});

export default defineEventHandler(async (event: H3Event) => {
  const tenantId = await getTenantId(event);
  const body = await readBody(event);

  const validationResult = themeSchema.safeParse(body);
  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      message: "Invalid theme configuration",
      data: validationResult.error.issues,
    });
  }

  const data = validationResult.data;
  const prisma = usePrisma();

  const themeConfig = await prisma.themeConfig.upsert({
    where: { tenantId },
    update: {
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      fontFamily: data.fontFamily || "Inter",
      layoutVariant: data.layoutVariant || "default",
      customCss: data.customCss,
    },
    create: {
      tenantId,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      fontFamily: data.fontFamily || "Inter",
      layoutVariant: data.layoutVariant || "default",
      customCss: data.customCss,
    },
  });

  return themeConfig;
});
