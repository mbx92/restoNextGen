import { z } from "zod";

const reviewSchema = z.object({
  authorName: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
  isPublished: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const data = reviewSchema.parse(body);

  const prisma = usePrisma();

  const review = await prisma.review.create({
    data,
  });

  return review;
});
