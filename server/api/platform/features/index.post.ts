import { z } from "zod";

/**
 * Platform Admin API - Create new feature
 * POST /api/platform/features
 */

const createFeatureSchema = z.object({
  code: z.string().min(1).max(100).toUpperCase(),
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export default defineEventHandler(async (event) => {
  // TODO: Add platform admin auth check
  // const platformAdmin = await getPlatformAdmin(event);

  const body = await readBody(event);
  const data = createFeatureSchema.parse(body);

  // Check if feature code already exists
  const existing = await prisma.feature.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: `Feature with code '${data.code}' already exists`,
    });
  }

  const feature = await prisma.feature.create({
    data,
    include: {
      category: true,
    },
  });

  return feature;
});
