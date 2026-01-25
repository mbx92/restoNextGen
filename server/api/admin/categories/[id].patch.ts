import { z } from "zod";

const categoryUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  sortOrder: z.number().optional(),
  isActive: z.boolean().optional(),
});

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Category ID required" });
  }

  const body = await readBody(event);
  const data = categoryUpdateSchema.parse(body);

  const prisma = usePrisma();

  // Verify category belongs to tenant
  const existing = await prisma.category.findFirst({
    where: { id, tenantId },
  });

  if (!existing) {
    throw createError({ statusCode: 404, message: "Category not found" });
  }

  const category = await prisma.category.update({
    where: { id },
    data,
  });

  return category;
});
