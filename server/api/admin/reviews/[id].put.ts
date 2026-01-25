import { z } from "zod";

const reviewSchema = z.object({
  authorName: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Review ID required" });
  }

  const body = await readBody(event);
  const data = reviewSchema.parse(body);

  const prisma = usePrisma();

  // Verify review belongs to tenant
  const existingReview = await prisma.review.findFirst({
    where: { id, tenantId },
  });

  if (!existingReview) {
    throw createError({ statusCode: 404, message: "Review not found" });
  }

  // If trying to set isFeatured to true, check the limit
  if (data.isFeatured === true) {
    // Only check limit if the review is not already featured
    if (!existingReview.isFeatured) {
      const featuredCount = await prisma.review.count({
        where: { tenantId, isFeatured: true },
      });

      if (featuredCount >= 6) {
        throw createError({
          statusCode: 400,
          message: "Maximum 6 reviews can be featured",
        });
      }
    }
  }

  const review = await prisma.review.update({
    where: { id },
    data,
  });

  return review;
});
