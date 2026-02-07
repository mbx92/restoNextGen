import { z } from "zod";

const menuItemUpdateSchema = z.object({
  categoryId: z.string().optional().nullable(),
  name: z.string().min(1).optional(),
  description: z.string().optional().nullable(),
  price: z.number().int().positive().optional(),
  photoUrl: z.string().optional().nullable(),
  isAvailable: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  stock: z.number().int().min(0).optional().nullable(),
  sku: z.string().optional().nullable(),
});

export default defineEventHandler(async (event) => {
  const tenantId = await getTenantId(event);
  const id = getRouterParam(event, "id");
  if (!id) {
    throw createError({ statusCode: 400, message: "Menu item ID required" });
  }

  const body = await readBody(event);
  const data = menuItemUpdateSchema.parse(body);

  // Convert empty string to null for categoryId
  if (data.categoryId === "") {
    data.categoryId = null;
  }

  const prisma = usePrisma();

  // Verify menu item belongs to tenant
  const existing = await prisma.menuItem.findFirst({
    where: { id, tenantId },
  });

  if (!existing) {
    throw createError({ statusCode: 404, message: "Menu item not found" });
  }

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data,
    include: {
      category: true,
    },
  });

  return menuItem;
});
