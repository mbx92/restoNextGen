import { z } from "zod";
import { requirePlatformAdmin } from "~/server/utils/platform-auth";

const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  price: z.number().int().min(0).optional(),
  billingInterval: z.enum(["month", "year"]).optional(),
  features: z.array(z.string()).optional(),
  limits: z
    .object({
      menuItems: z.number().int(),
      tables: z.number().int(),
      orders: z.number().int(),
      users: z.number().int(),
      storage: z.number().int(),
      locations: z.number().int().optional(),
    })
    .optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * PATCH /api/platform/plans/:id
 * Update a plan
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const prisma = usePrisma();
  const planId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!planId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Plan ID is required",
    });
  }

  const data = updatePlanSchema.parse(body);

  const plan = await prisma.plan.update({
    where: { id: planId },
    data,
  });

  return plan;
});
