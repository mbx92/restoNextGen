import { getThemePresetsByBusinessType, themePresets } from "~/server/config/theme-presets";
import prisma from "~/server/db/prisma";

export default defineEventHandler(async (event) => {
  try {
    const tenantId = await getTenantId(event);

    // Get tenant to know business type
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { businessType: true },
    });

    if (!tenant) {
      // If tenant not found but we have tenantId, return all presets
      console.warn("Tenant not found for ID:", tenantId);
      return themePresets;
    }

    // Get presets filtered by business type
    const presets = getThemePresetsByBusinessType(tenant.businessType);

    return presets;
  } catch (error) {
    // If authentication fails, return all presets (fallback)
    console.warn("Theme presets API - Auth error, returning all presets:", error);
    return themePresets;
  }
});
