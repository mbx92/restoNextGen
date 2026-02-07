import { z } from "zod";
import { requirePlatformAdmin } from "~/server/utils/platform-auth";

const createPlanSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  price: z.number().int().min(0),
  billingInterval: z.enum(["month", "year"]),
  features: z.array(z.string()),
  limits: z.object({
    menuItems: z.number().int(),
    tables: z.number().int(),
    orders: z.number().int(),
    users: z.number().int(),
    storage: z.number().int(),
    locations: z.number().int().optional(),
  }),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

/**
 * POST /api/platform/plans
 * Create a new plan
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const prisma = usePrisma();
  const body = await readBody(event);

  const data = createPlanSchema.parse(body);

  // Check if slug already exists
  const existing = await prisma.plan.findUnique({
    where: { slug: data.slug },
  });

  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: "Plan with this slug already exists",
    });
  }

  const plan = await prisma.plan.create({
    data,
  });

  return plan;
});
