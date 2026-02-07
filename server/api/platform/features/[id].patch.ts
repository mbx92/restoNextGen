import { z } from "zod";

/**
 * Platform Admin API - Update feature
 * PATCH /api/platform/features/[id]
 */

const updateFeatureSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  // TODO: Add platform admin auth check
  // const platformAdmin = await getPlatformAdmin(event);

  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Feature ID is required",
    });
  }

  const body = await readBody(event);
  const data = updateFeatureSchema.parse(body);

  const feature = await prisma.feature.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });

  return feature;
});
