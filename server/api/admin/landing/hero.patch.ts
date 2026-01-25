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
  const body = await readBody(event);
  const validated = updateSchema.parse(body);

  const prisma = usePrisma();

  // Get or create hero (should only be one)
  const existing = await prisma.landingHero.findFirst();

  let hero;
  if (existing) {
    hero = await prisma.landingHero.update({
      where: { id: existing.id },
      data: validated,
    });
  } else {
    hero = await prisma.landingHero.create({
      data: {
        title: validated.title || "Welcome to wrPadi",
        subtitle: validated.subtitle || "Authentic Indonesian Salmon Fish Soup",
        description: validated.description || "Experience the rich flavors",
        ctaText: validated.ctaText || "Book a Table",
        ctaLink: validated.ctaLink || "/reservation",
        imageUrl: validated.imageUrl || "https://placehold.co/1200x600",
        promoText: validated.promoText,
        isActive: validated.isActive ?? true,
      },
    });
  }

  return hero;
});
