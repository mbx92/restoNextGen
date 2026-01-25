import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

async function main() {
  console.log("🌱 Seeding database...");

  // ============================================================================
  // 0. Create Platform Super Admin
  // ============================================================================
  const existingSuperAdmin = await prisma.platformAdmin.findUnique({
    where: { email: "superadmin@wrpadi.com" },
  });

  if (!existingSuperAdmin) {
    const passwordHash = await hashPassword("superadmin123");
    const superAdmin = await prisma.platformAdmin.create({
      data: {
        email: "superadmin@wrpadi.com",
        passwordHash,
        name: "Super Admin",
        role: "superadmin",
        isActive: true,
      },
    });
    console.log("✅ Platform Super Admin created:", superAdmin.email);
  } else {
    console.log("ℹ️  Platform Super Admin already exists");
  }

  // ============================================================================
  // 1. Create default tenant
  // ============================================================================
  let tenant = await prisma.tenant.findUnique({
    where: { slug: "demo-restaurant" },
  });

  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        slug: "demo-restaurant",
        name: "wrPadi - Demo Restaurant",
        businessType: "restaurant",
        ownerEmail: "owner@wrpadi.com",
        ownerName: "Restaurant Owner",
        plan: "pro",
        isActive: true,
      },
    });
    console.log("✅ Tenant created:", tenant.slug);
  } else {
    console.log("ℹ️  Tenant already exists:", tenant.slug);
  }

  const tenantId = tenant.id;

  // ============================================================================
  // 1b. Create subscription for tenant
  // ============================================================================
  const existingSubscription = await prisma.subscription.findUnique({
    where: { tenantId },
  });

  if (!existingSubscription) {
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 30); // 30 days trial

    await prisma.subscription.create({
      data: {
        tenantId,
        plan: "pro",
        status: "TRIAL",
        trialEndsAt,
        currentPeriodStart: new Date(),
        currentPeriodEnd: trialEndsAt,
      },
    });
    console.log("✅ Subscription created for tenant");
  }

  // ============================================================================
  // 2. Create default admin user for tenant
  // ============================================================================
  const existingAdmin = await prisma.adminUser.findUnique({
    where: {
      tenantId_email: {
        tenantId,
        email: "admin@wrpadi.com",
      },
    },
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword("admin123");
    const admin = await prisma.adminUser.create({
      data: {
        tenantId,
        email: "admin@wrpadi.com",
        passwordHash,
        name: "Admin",
        isActive: true,
      },
    });
    console.log("✅ Admin user created:", admin.email);
  } else {
    console.log("ℹ️  Admin user already exists");
  }

  // ============================================================================
  // 3. Business Info (generic, with metadata for restaurant-specific fields)
  // ============================================================================
  const existingInfo = await prisma.businessInfo.findUnique({
    where: { tenantId },
  });
  if (!existingInfo) {
    await prisma.businessInfo.create({
      data: {
        tenantId,
        name: "wrPadi - Authentic Salmon Soup",
        description:
          "Experience the finest Indonesian salmon fish soup, crafted with fresh ingredients and traditional recipes passed down through generations.",
        address:
          "Jl. Kuliner Nusantara No. 88\nJakarta Selatan, DKI Jakarta 12345",
        phoneNumber: "+62 812 3456 7890",
        email: "info@wrpadi.com",
        mapsUrl: "https://maps.google.com/",
        mapsEmbedUrl:
          "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.2!2d106.8!3d-6.2!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNsKwMTInMDAuMCJTIDEwNsKwNDgnMDAuMCJF!5e0!3m2!1sen!2sid!4v1234567890",
        metadata: {
          openingHours:
            "Monday - Friday: 10:00 - 22:00\nSaturday - Sunday: 09:00 - 23:00",
        },
      },
    });
    console.log("✅ Business info created");
  }

  // ============================================================================
  // 4. Theme Config
  // ============================================================================
  const existingTheme = await prisma.themeConfig.findUnique({
    where: { tenantId },
  });
  if (!existingTheme) {
    await prisma.themeConfig.create({
      data: {
        tenantId,
        primaryColor: "#16a34a",
        secondaryColor: "#ca8a04",
        fontFamily: "Inter",
        layoutVariant: "default",
      },
    });
    console.log("✅ Theme config created");
  }

  // ============================================================================
  // 5. Landing Hero
  // ============================================================================
  const existingHero = await prisma.landingHero.findFirst({
    where: { tenantId },
  });
  if (!existingHero) {
    await prisma.landingHero.create({
      data: {
        tenantId,
        title: "Authentic Indonesian",
        subtitle: "Salmon Fish Soup",
        description:
          "Fresh salmon cooked to perfection in our secret broth recipe. A taste of tradition in every bowl.",
        ctaText: "Order Now",
        ctaLink: "#menu",
        promoText: "🎉 Grand Opening - 20% Off All Orders!",
        imageUrl:
          "https://images.unsplash.com/photo-1606787366850-de6330128bfc",
        isActive: true,
      },
    });
    console.log("✅ Landing hero created");
  }

  // ============================================================================
  // 6. Sample Reviews
  // ============================================================================
  const existingReviews = await prisma.review.count({
    where: { tenantId },
  });
  if (existingReviews === 0) {
    await prisma.review.createMany({
      data: [
        {
          tenantId,
          authorName: "Budi Santoso",
          rating: 5,
          comment:
            "Sup ikan salmon terbaik yang pernah saya coba! Kuahnya segar dan ikannya sangat lembut.",
          isPublished: true,
          isFeatured: true,
        },
        {
          tenantId,
          authorName: "Sarah Williams",
          rating: 5,
          comment:
            "The salmon soup is absolutely delicious. The atmosphere is cozy and the service is excellent!",
          isPublished: true,
          isFeatured: true,
        },
        {
          tenantId,
          authorName: "Indra Wijaya",
          rating: 4,
          comment:
            "Rasanya enak, porsinya juga pas. Recommended untuk pecinta seafood!",
          isPublished: true,
          isFeatured: true,
        },
        {
          tenantId,
          authorName: "Lisa Chen",
          rating: 5,
          comment:
            "Fresh ingredients and authentic taste. Will definitely come back!",
          isPublished: true,
          isFeatured: false,
        },
      ],
    });
    console.log("✅ Sample reviews created");
  }

  // ============================================================================
  // 7. Site Settings (Header & Footer)
  // ============================================================================
  const existingHeader = await prisma.siteSettings.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key: "header",
      },
    },
  });
  if (!existingHeader) {
    await prisma.siteSettings.create({
      data: {
        tenantId,
        key: "header",
        logoText: "wrPadi",
        logoUrl: "",
        facebookUrl: "https://facebook.com/wrpadi",
        instagramUrl: "https://instagram.com/wrpadi",
        twitterUrl: "https://twitter.com/wrpadi",
      },
    });
    console.log("✅ Header settings created");
  }

  const existingFooter = await prisma.siteSettings.findUnique({
    where: {
      tenantId_key: {
        tenantId,
        key: "footer",
      },
    },
  });
  if (!existingFooter) {
    await prisma.siteSettings.create({
      data: {
        tenantId,
        key: "footer",
        copyrightText: "© 2026 wrPadi. All rights reserved.",
        footerLinks: [
          { label: "Privacy Policy", url: "/privacy" },
          { label: "Terms of Service", url: "/terms" },
          { label: "Contact Us", url: "#location" },
        ],
      },
    });
    console.log("✅ Footer settings created");
  }

  // ============================================================================
  // 8. Categories (Restaurant module)
  // ============================================================================
  const existingCategories = await prisma.category.count({
    where: { tenantId },
  });
  if (existingCategories === 0) {
    await prisma.category.createMany({
      data: [
        {
          tenantId,
          name: "Soup",
          slug: "soup",
          sortOrder: 1,
          isActive: true,
        },
        {
          tenantId,
          name: "Appetizer",
          slug: "appetizer",
          sortOrder: 2,
          isActive: true,
        },
        {
          tenantId,
          name: "Drinks",
          slug: "drinks",
          sortOrder: 3,
          isActive: true,
        },
      ],
    });
    console.log("✅ Categories created");
  }

  // ============================================================================
  // 9. Menu Items (Restaurant module)
  // ============================================================================
  const existingMenuItems = await prisma.menuItem.count({
    where: { tenantId },
  });
  if (existingMenuItems === 0) {
    const soupCategory = await prisma.category.findFirst({
      where: { tenantId, slug: "soup" },
    });
    const appetizerCategory = await prisma.category.findFirst({
      where: { tenantId, slug: "appetizer" },
    });
    const drinksCategory = await prisma.category.findFirst({
      where: { tenantId, slug: "drinks" },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          tenantId,
          categoryId: soupCategory?.id,
          name: "Salmon Fish Soup Original",
          description:
            "Our signature salmon soup with secret broth recipe, fresh vegetables, and tender salmon fillet",
          price: 65000,
          photoUrl:
            "https://images.unsplash.com/photo-1559339352-11d035aa65de",
          isAvailable: true,
          isFeatured: true,
          sortOrder: 1,
        },
        {
          tenantId,
          categoryId: soupCategory?.id,
          name: "Spicy Salmon Soup",
          description:
            "Traditional salmon soup with a spicy kick, perfect for spice lovers",
          price: 70000,
          photoUrl:
            "https://images.unsplash.com/photo-1547592166-23ac45744acd",
          isAvailable: true,
          isFeatured: true,
          sortOrder: 2,
        },
        {
          tenantId,
          categoryId: appetizerCategory?.id,
          name: "Fried Spring Rolls",
          description: "Crispy spring rolls filled with vegetables and spices",
          price: 25000,
          photoUrl:
            "https://images.unsplash.com/photo-1558030006-450675393462",
          isAvailable: true,
          isFeatured: false,
          sortOrder: 3,
        },
        {
          tenantId,
          categoryId: drinksCategory?.id,
          name: "Fresh Orange Juice",
          description: "Freshly squeezed orange juice, no sugar added",
          price: 18000,
          photoUrl:
            "https://images.unsplash.com/photo-1600271886742-f049cd451bba",
          isAvailable: true,
          isFeatured: false,
          sortOrder: 4,
        },
        {
          tenantId,
          categoryId: drinksCategory?.id,
          name: "Iced Tea",
          description: "Refreshing homemade iced tea",
          price: 12000,
          photoUrl:
            "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
          isAvailable: true,
          isFeatured: false,
          sortOrder: 5,
        },
      ],
    });
    console.log("✅ Menu items created");
  }

  console.log("✨ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
