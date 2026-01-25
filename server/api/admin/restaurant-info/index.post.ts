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
  const tenantId = await getTenantId(event);
  const body = await readBody(event);
  const data = restaurantInfoSchema.parse(body);

  const prisma = usePrisma();

  // Upsert business info with openingHours in metadata
  const info = await prisma.businessInfo.upsert({
    where: { tenantId },
    update: {
      name: data.name,
      description: data.description,
      address: data.address,
      phoneNumber: data.phoneNumber,
      email: data.email,
      mapsUrl: data.mapsUrl || null,
      mapsEmbedUrl: data.mapsEmbedUrl || null,
      metadata: {
        openingHours: data.openingHours,
      },
    },
    create: {
      tenantId,
      name: data.name,
      description: data.description,
      address: data.address,
      phoneNumber: data.phoneNumber,
      email: data.email,
      mapsUrl: data.mapsUrl || null,
      mapsEmbedUrl: data.mapsEmbedUrl || null,
      metadata: {
        openingHours: data.openingHours,
      },
    },
  });

  // Return with backward compatibility
  return {
    ...info,
    openingHours: data.openingHours,
  };
});
