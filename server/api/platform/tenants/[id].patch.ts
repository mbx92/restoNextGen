import { z } from "zod";
import { requirePlatformAdmin } from "~/server/utils/platform-auth";

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  businessType: z.enum(["restaurant", "retail", "salon"]).optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  isActive: z.boolean().optional(),
});

/**
 * PATCH /api/platform/tenants/:id
 * Update a tenant
 */
export default defineEventHandler(async (event) => {
  await requirePlatformAdmin(event);
  const prisma = usePrisma();
  const tenantId = getRouterParam(event, "id");
  const body = await readBody(event);

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Tenant ID is required",
    });
  }

  const data = updateTenantSchema.parse(body);

  // Check if slug is being updated and if it's unique
  if (data.slug) {
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        slug: data.slug,
        id: { not: tenantId },
      },
    });

    if (existingTenant) {
      throw createError({
        statusCode: 409,
        statusMessage: "Slug already exists",
      });
    }
  }

  const tenant = await prisma.tenant.update({
    where: { id: tenantId },
    data,
  });

  return tenant;
});
