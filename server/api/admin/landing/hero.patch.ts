import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  subtitle: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  ctaText: z.string().min(1).optional(),
  ctaLink: z.string().optional(),
  promoText: z.string().optional(),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const body = await readBody(event);
  const validated = updateSchema.parse(body);

  const prisma = usePrisma();

  // Get or create hero for this tenant
  const existing = await prisma.landingHero.findFirst({
    where: { tenantId },
  });

  let hero;
  if (existing) {
    hero = await prisma.landingHero.update({
      where: { id: existing.id },
      data: validated,
    });
  } else {
    hero = await prisma.landingHero.create({
      data: {
        tenantId,
        title: validated.title || "Welcome",
        subtitle: validated.subtitle || "Your Business",
        description: validated.description || "Experience the best",
        ctaText: validated.ctaText || "Get Started",
        ctaLink: validated.ctaLink || "#",
        imageUrl: validated.imageUrl || "https://placehold.co/1200x600",
        promoText: validated.promoText,
        isActive: validated.isActive ?? true,
      },
    });
  }

  return hero;
});
