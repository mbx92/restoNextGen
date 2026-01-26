import { z } from "zod";

const updateSchema = z.object({
  campaignId: z.string().nullable().optional(),
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  promoText: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Hero ID is required",
    });
  }

  const body = await readBody(event);
  const validated = updateSchema.parse(body);

  const prisma = usePrisma();
  const hero = await prisma.landingHero.update({
    where: { id },
    data: validated,
  });

  return hero;
});
