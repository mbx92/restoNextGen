import { z } from "zod";

const reviewSchema = z.object({
  authorName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

import { hasFeature } from "~/server/utils/feature-gating";

export default defineEventHandler(async (event) => {
  // Check if CMS feature is enabled
  if (!(await hasFeature(event, "CONTENT_MANAGEMENT_SERVICE"))) {
    throw createError({
      statusCode: 403,
      statusMessage: "Content Management Service is not available in your plan. Please upgrade to access this feature.",
    });
  }

  const tenantId = await getTenantId(event);
  const body = await readBody(event);
  const data = reviewSchema.parse(body);

  const prisma = usePrisma();

  const review = await prisma.review.create({
    data: {
      tenantId,
      ...data,
    },
  });

  return review;
});
