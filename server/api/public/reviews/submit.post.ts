import { z } from "zod";

const reviewSubmitSchema = z.object({
  authorName: z.string().min(1, "Name is required").max(100),
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .min(10, "Comment must be at least 10 characters")
    .max(500),
  tableCode: z.string().optional(), // From QR code
  orderId: z.string().optional(), // From QR code
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = reviewSubmitSchema.parse(body);

  const prisma = usePrisma();

  // Resolve tenant from header (for public endpoints)
  const tenantSlug = getHeader(event, "x-tenant-slug") || "demo-restaurant";

  const tenant = await prisma.tenant.findUnique({
    where: { slug: tenantSlug, isActive: true },
  });

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: "Tenant not found",
    });
  }

  // Create review as pending (isPublished = false)
  const review = await prisma.review.create({
    data: {
      tenantId: tenant.id,
      authorName: data.authorName,
      rating: data.rating,
      comment: data.comment,
      isPublished: false, // Pending approval
      isFeatured: false,
    },
  });

  return {
    success: true,
    message:
      "Thank you for your review! It will be published after moderation.",
    reviewId: review.id,
  };
});
