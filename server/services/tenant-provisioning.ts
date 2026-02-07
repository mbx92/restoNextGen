import { hash } from "ohash";
import { usePrisma } from "../utils/prisma";
import { getBusinessType } from "../config/business-types";

export interface TenantProvisioningData {
  slug: string;
  name: string;
  businessType: string;
  ownerEmail: string;
  ownerName: string;
  ownerPassword: string;
  plan?: string;
}

export interface ProvisioningResult {
  success: boolean;
  tenantId?: string;
  slug?: string;
  error?: string;
}

/**
 * Provision a new tenant with default data
 */
export async function provisionTenant(
  data: TenantProvisioningData,
): Promise<ProvisioningResult> {
  const prisma = usePrisma();

  try {
    // Validate business type
    const businessType = getBusinessType(data.businessType);
    if (!businessType) {
      return {
        success: false,
        error: `Invalid business type: ${data.businessType}`,
      };
    }

    // Check if slug is already taken
    const existingTenant = await prisma.tenant.findUnique({
      where: { slug: data.slug },
    });

    if (existingTenant) {
      return {
        success: false,
        error: "Slug is already taken. Please choose a different one.",
      };
    }

    // Check if email is already used
    const existingAdmin = await prisma.adminUser.findFirst({
      where: { email: data.ownerEmail },
    });

    if (existingAdmin) {
      return {
        success: false,
        error: "Email is already registered.",
      };
    }

    // Hash password
    const passwordHash = hash(data.ownerPassword);

    // Create tenant in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create tenant
      const tenant = await tx.tenant.create({
        data: {
          slug: data.slug,
          name: data.name,
          businessType: data.businessType,
          ownerEmail: data.ownerEmail,
          ownerName: data.ownerName,
          plan: data.plan || "free",
          isActive: true,
        },
      });

      // 2. Create admin user
      await tx.adminUser.create({
        data: {
          tenantId: tenant.id,
          email: data.ownerEmail,
          name: data.ownerName,
          passwordHash,
          isActive: true,
        },
      });

      // 3. Get the plan to use
      const planSlug = data.plan || "free";
      const plan = await tx.plan.findUnique({
        where: { slug: planSlug },
      });

      if (!plan) {
        throw new Error(`Plan '${planSlug}' not found`);
      }

      // 4. Create subscription
      await tx.subscription.create({
        data: {
          tenantId: tenant.id,
          planId: plan.id,
          plan: planSlug, // Keep legacy field for now
          status: "TRIAL",
          trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days trial
        },
      });

      // 5. Create business info
      await tx.businessInfo.create({
        data: {
          tenantId: tenant.id,
          name: data.name,
          description: `Welcome to ${data.name}`,
        },
      });

      // 6. Create theme config
      await tx.themeConfig.create({
        data: {
          tenantId: tenant.id,
          primaryColor: "#16a34a",
          secondaryColor: "#ca8a04",
          fontFamily: "Inter",
          layoutVariant: "default",
        },
      });

      // 7. Create default site settings
      await tx.siteSettings.create({
        data: {
          tenantId: tenant.id,
          key: "header",
          logoText: data.name,
        },
      });

      await tx.siteSettings.create({
        data: {
          tenantId: tenant.id,
          key: "footer",
          copyrightText: `© 2026 ${data.name}. All rights reserved.`,
        },
      });

      // 8. Business-specific setup
      if (data.businessType === "restaurant") {
        // Create default category
        const category = await tx.category.create({
          data: {
            tenantId: tenant.id,
            name: "Main Menu",
            slug: "main-menu",
            sortOrder: 1,
          },
        });

        // Create sample menu item
        await tx.menuItem.create({
          data: {
            tenantId: tenant.id,
            categoryId: category.id,
            name: "Sample Item",
            description: "This is a sample menu item. Edit or delete this.",
            price: 10000,
            isAvailable: true,
          },
        });

        // Create default table
        await tx.table.create({
          data: {
            tenantId: tenant.id,
            tableCode: "TABLE-001",
            name: "Table 1",
            capacity: 4,
            isActive: true,
          },
        });
      }

      return tenant;
    });

    return {
      success: true,
      tenantId: result.id,
      slug: result.slug,
    };
  } catch (error) {
    console.error("Tenant provisioning error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to provision tenant. Please try again.",
    };
  }
}

/**
 * Check if slug is available
 */
export async function checkSlugAvailability(
  slug: string,
): Promise<{ available: boolean; suggestion?: string }> {
  const prisma = usePrisma();

  const existingTenant = await prisma.tenant.findUnique({
    where: { slug },
  });

  if (!existingTenant) {
    return { available: true };
  }

  // Generate suggestion
  const randomSuffix = Math.floor(Math.random() * 1000);
  const suggestion = `${slug}${randomSuffix}`;

  return {
    available: false,
    suggestion,
  };
}
