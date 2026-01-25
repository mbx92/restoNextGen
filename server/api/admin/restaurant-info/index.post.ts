import { z } from "zod";

const restaurantInfoSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  address: z.string().min(1),
  phoneNumber: z.string().min(1),
  email: z.string().email(),
  mapsUrl: z.string().optional(),
  mapsEmbedUrl: z.string().optional(),
  openingHours: z.string().min(1),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = restaurantInfoSchema.parse(body);

  const prisma = usePrisma();

  // Find existing info
  const existing = await prisma.restaurantInfo.findFirst();

  let info;
  if (existing) {
    // Update
    info = await prisma.restaurantInfo.update({
      where: { id: existing.id },
      data,
    });
  } else {
    // Create
    info = await prisma.restaurantInfo.create({
      data,
    });
  }

  return info;
});
