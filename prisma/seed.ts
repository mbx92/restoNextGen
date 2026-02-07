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
  // 2b. Create sample users with different roles
  // ============================================================================
  const users = [
    {
      email: "owner@wrpadi.com",
      name: "Restaurant Owner",
      role: "OWNER" as const,
      password: "owner123",
      phoneNumber: "+62 812 1111 1111",
    },
    {
      email: "manager@wrpadi.com",
      name: "Floor Manager",
      role: "MANAGER" as const,
      password: "manager123",
      phoneNumber: "+62 812 2222 2222",
    },
    {
      email: "cashier@wrpadi.com",
      name: "Cashier Staff",
      role: "CASHIER" as const,
      password: "cashier123",
      phoneNumber: "+62 812 3333 3333",
    },
    {
      email: "waiter@wrpadi.com",
      name: "Waiter Staff",
      role: "WAITER" as const,
      password: "waiter123",
      phoneNumber: "+62 812 4444 4444",
    },
    {
      email: "kitchen@wrpadi.com",
      name: "Kitchen Staff",
      role: "KITCHEN" as const,
      password: "kitchen123",
      phoneNumber: "+62 812 5555 5555",
    },
    {
      email: "customer@wrpadi.com",
      name: "Regular Customer",
      role: "CUSTOMER" as const,
      password: "customer123",
      phoneNumber: "+62 812 9999 9999",
    },
  ];

  for (const userData of users) {
    const existingUser = await prisma.user.findUnique({
      where: {
        tenantId_email: {
          tenantId,
          email: userData.email,
        },
      },
    });

    if (!existingUser) {
      const passwordHash = await hashPassword(userData.password);
      await prisma.user.create({
        data: {
          tenantId,
          email: userData.email,
          passwordHash,
          name: userData.name,
          role: userData.role,
          phoneNumber: userData.phoneNumber,
          isActive: true,
        },
      });
      console.log(`✅ User created: ${userData.email} (${userData.role})`);
    }
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
        primaryColor: "#d97706", // restaurant-warm theme
        secondaryColor: "#92400e",
        fontFamily: "Lora",
        layoutVariant: "default",
      },
    });
    console.log("✅ Theme config created (restaurant-warm)");
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
          photoUrl: "https://images.unsplash.com/photo-1559339352-11d035aa65de",
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
          photoUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd",
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
          photoUrl: "https://images.unsplash.com/photo-1558030006-450675393462",
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
          photoUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc",
          isAvailable: true,
          isFeatured: false,
          sortOrder: 5,
        },
      ],
    });
    console.log("✅ Menu items created");
  }

  // ============================================================================
  // 8. Seed RBAC System (Roles, Permissions, Business Type Templates)
  // ============================================================================
  console.log("🔐 Seeding RBAC system...");

  // Define all permissions
  const permissions = [
    // User Management
    {
      code: "MANAGE_USERS",
      name: "Manage Users",
      description: "Create, update, delete users",
      category: "User Management",
    },
    {
      code: "VIEW_USERS",
      name: "View Users",
      description: "View user list and details",
      category: "User Management",
    },

    // Menu Management
    {
      code: "MANAGE_MENU",
      name: "Manage Menu",
      description: "Create, update, delete menu items",
      category: "Menu Management",
    },
    {
      code: "VIEW_MENU",
      name: "View Menu",
      description: "View menu items",
      category: "Menu Management",
    },
    {
      code: "MANAGE_CATEGORIES",
      name: "Manage Categories",
      description: "Manage menu categories",
      category: "Menu Management",
    },

    // Orders
    {
      code: "CREATE_ORDER",
      name: "Create Order",
      description: "Create new orders",
      category: "Orders",
    },
    {
      code: "VIEW_ALL_ORDERS",
      name: "View All Orders",
      description: "View all orders in the system",
      category: "Orders",
    },
    {
      code: "VIEW_OWN_ORDERS",
      name: "View Own Orders",
      description: "View own orders only",
      category: "Orders",
    },
    {
      code: "UPDATE_ORDER_STATUS",
      name: "Update Order Status",
      description: "Update order status",
      category: "Orders",
    },
    {
      code: "CANCEL_ORDER",
      name: "Cancel Order",
      description: "Cancel orders",
      category: "Orders",
    },

    // Tables
    {
      code: "MANAGE_TABLES",
      name: "Manage Tables",
      description: "Create, update, delete tables",
      category: "Tables",
    },
    {
      code: "VIEW_TABLES",
      name: "View Tables",
      description: "View table list and status",
      category: "Tables",
    },

    // Reservations
    {
      code: "MANAGE_RESERVATIONS",
      name: "Manage Reservations",
      description: "Approve, reject, manage reservations",
      category: "Reservations",
    },
    {
      code: "VIEW_RESERVATIONS",
      name: "View Reservations",
      description: "View reservation list",
      category: "Reservations",
    },
    {
      code: "CREATE_RESERVATION",
      name: "Create Reservation",
      description: "Create new reservation",
      category: "Reservations",
    },

    // Payments
    {
      code: "PROCESS_PAYMENT",
      name: "Process Payment",
      description: "Process and confirm payments",
      category: "Payments",
    },
    {
      code: "VIEW_PAYMENTS",
      name: "View Payments",
      description: "View payment history",
      category: "Payments",
    },

    // Reviews
    {
      code: "MODERATE_REVIEWS",
      name: "Moderate Reviews",
      description: "Approve, reject, manage reviews",
      category: "Reviews",
    },
    {
      code: "WRITE_REVIEW",
      name: "Write Review",
      description: "Write customer reviews",
      category: "Reviews",
    },

    // Site Settings
    {
      code: "MANAGE_SETTINGS",
      name: "Manage Settings",
      description: "Manage site settings",
      category: "Site Settings",
    },
    {
      code: "MANAGE_THEME",
      name: "Manage Theme",
      description: "Customize site theme",
      category: "Site Settings",
    },
    {
      code: "MANAGE_LANDING",
      name: "Manage Landing Page",
      description: "Edit landing page content",
      category: "Site Settings",
    },

    // Dashboard
    {
      code: "VIEW_DASHBOARD",
      name: "View Dashboard",
      description: "Access admin dashboard",
      category: "Dashboard",
    },
    {
      code: "VIEW_ANALYTICS",
      name: "View Analytics",
      description: "View analytics and reports",
      category: "Dashboard",
    },

    // Kitchen Display
    {
      code: "VIEW_KITCHEN_DISPLAY",
      name: "View Kitchen Display",
      description: "View kitchen display system",
      category: "Kitchen",
    },
  ];

  for (const perm of permissions) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }
  console.log(`✅ Created ${permissions.length} permissions`);

  // Define all roles
  const roles = [
    {
      code: "OWNER",
      name: "Owner",
      description: "Full access to all features",
      hierarchy: 5,
    },
    {
      code: "MANAGER",
      name: "Manager",
      description: "Manage operations and staff",
      hierarchy: 4,
    },
    {
      code: "CASHIER",
      name: "Cashier",
      description: "Handle payments and POS",
      hierarchy: 3,
    },
    {
      code: "WAITER",
      name: "Waiter",
      description: "Create and manage orders",
      hierarchy: 3,
    },
    {
      code: "KITCHEN",
      name: "Kitchen Staff",
      description: "Kitchen display and order status",
      hierarchy: 3,
    },
    {
      code: "CUSTOMER",
      name: "Customer",
      description: "Place orders and reviews",
      hierarchy: 1,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { code: role.code },
      update: {},
      create: role,
    });
  }
  console.log(`✅ Created ${roles.length} roles`);

  // Define role-permission matrix (same as current rbac.ts)
  const rolePermissions: Record<string, string[]> = {
    OWNER: [
      "MANAGE_USERS",
      "VIEW_USERS",
      "MANAGE_MENU",
      "VIEW_MENU",
      "MANAGE_CATEGORIES",
      "CREATE_ORDER",
      "VIEW_ALL_ORDERS",
      "UPDATE_ORDER_STATUS",
      "CANCEL_ORDER",
      "MANAGE_TABLES",
      "VIEW_TABLES",
      "MANAGE_RESERVATIONS",
      "VIEW_RESERVATIONS",
      "PROCESS_PAYMENT",
      "VIEW_PAYMENTS",
      "MODERATE_REVIEWS",
      "MANAGE_SETTINGS",
      "MANAGE_THEME",
      "MANAGE_LANDING",
      "VIEW_DASHBOARD",
      "VIEW_ANALYTICS",
    ],
    MANAGER: [
      "MANAGE_USERS",
      "VIEW_USERS",
      "MANAGE_MENU",
      "VIEW_MENU",
      "MANAGE_CATEGORIES",
      "CREATE_ORDER",
      "VIEW_ALL_ORDERS",
      "UPDATE_ORDER_STATUS",
      "CANCEL_ORDER",
      "MANAGE_TABLES",
      "VIEW_TABLES",
      "MANAGE_RESERVATIONS",
      "VIEW_RESERVATIONS",
      "PROCESS_PAYMENT",
      "VIEW_PAYMENTS",
      "MODERATE_REVIEWS",
      "MANAGE_LANDING",
      "VIEW_DASHBOARD",
      "VIEW_ANALYTICS",
    ],
    CASHIER: [
      "VIEW_MENU",
      "CREATE_ORDER",
      "UPDATE_ORDER_STATUS",
      "CANCEL_ORDER",
      "PROCESS_PAYMENT",
      "VIEW_PAYMENTS",
    ],
    WAITER: [
      "VIEW_MENU",
      "CREATE_ORDER",
      "VIEW_TABLES",
      "MANAGE_RESERVATIONS",
      "VIEW_RESERVATIONS",
    ],
    KITCHEN: [
      "VIEW_MENU",
      "VIEW_ALL_ORDERS",
      "UPDATE_ORDER_STATUS",
      "VIEW_KITCHEN_DISPLAY",
    ],
    CUSTOMER: [
      "VIEW_MENU",
      "CREATE_ORDER",
      "VIEW_OWN_ORDERS",
      "CREATE_RESERVATION",
      "WRITE_REVIEW",
    ],
  };

  for (const [roleCode, permCodes] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) continue;

    for (const permCode of permCodes) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });
      if (!permission) continue;

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
  console.log("✅ Assigned permissions to roles");

  // Define business type templates (lowercase to match tenant data)
  const businessTypes = ["restaurant", "cafe", "bakery"];

  // Restaurant: All roles enabled
  const restaurantRoles = [
    "OWNER",
    "MANAGER",
    "CASHIER",
    "WAITER",
    "KITCHEN",
    "CUSTOMER",
  ];
  for (const roleCode of restaurantRoles) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) continue;

    await prisma.businessTypeRole.upsert({
      where: {
        businessType_roleId: {
          businessType: "restaurant",
          roleId: role.id,
        },
      },
      update: {},
      create: {
        businessType: "restaurant",
        roleId: role.id,
        isEnabled: true,
      },
    });
  }

  // Restaurant: All permissions enabled
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.businessTypePermission.upsert({
      where: {
        businessType_permissionId: {
          businessType: "restaurant",
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        businessType: "restaurant",
        permissionId: permission.id,
        isEnabled: true,
      },
    });
  }

  // Cafe: Limited features (no reservations, no kitchen display)
  const cafeRoles = ["OWNER", "MANAGER", "CASHIER", "WAITER", "CUSTOMER"];
  for (const roleCode of cafeRoles) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) continue;

    await prisma.businessTypeRole.upsert({
      where: {
        businessType_roleId: {
          businessType: "cafe",
          roleId: role.id,
        },
      },
      update: {},
      create: {
        businessType: "cafe",
        roleId: role.id,
        isEnabled: true,
      },
    });
  }

  // Cafe: Exclude reservation & kitchen permissions
  const cafeExcludedPerms = [
    "MANAGE_RESERVATIONS",
    "VIEW_RESERVATIONS",
    "CREATE_RESERVATION",
    "VIEW_KITCHEN_DISPLAY",
  ];
  for (const permission of allPermissions) {
    if (cafeExcludedPerms.includes(permission.code)) continue;

    await prisma.businessTypePermission.upsert({
      where: {
        businessType_permissionId: {
          businessType: "cafe",
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        businessType: "cafe",
        permissionId: permission.id,
        isEnabled: true,
      },
    });
  }

  // Bakery: Takeaway only (no tables, no reservations, no kitchen)
  const bakeryRoles = ["OWNER", "MANAGER", "CASHIER", "CUSTOMER"];
  for (const roleCode of bakeryRoles) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) continue;

    await prisma.businessTypeRole.upsert({
      where: {
        businessType_roleId: {
          businessType: "bakery",
          roleId: role.id,
        },
      },
      update: {},
      create: {
        businessType: "bakery",
        roleId: role.id,
        isEnabled: true,
      },
    });
  }

  // Bakery: Exclude tables, reservations, kitchen
  const bakeryExcludedPerms = [
    "MANAGE_TABLES",
    "VIEW_TABLES",
    "MANAGE_RESERVATIONS",
    "VIEW_RESERVATIONS",
    "CREATE_RESERVATION",
    "VIEW_KITCHEN_DISPLAY",
  ];
  for (const permission of allPermissions) {
    if (bakeryExcludedPerms.includes(permission.code)) continue;

    await prisma.businessTypePermission.upsert({
      where: {
        businessType_permissionId: {
          businessType: "bakery",
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        businessType: "bakery",
        permissionId: permission.id,
        isEnabled: true,
      },
    });
  }

  // Retail: POS-focused (OWNER, MANAGER, CASHIER, CUSTOMER only)
  const retailRoles = ["OWNER", "MANAGER", "CASHIER", "CUSTOMER"];
  for (const roleCode of retailRoles) {
    const role = await prisma.role.findUnique({ where: { code: roleCode } });
    if (!role) continue;

    await prisma.businessTypeRole.upsert({
      where: {
        businessType_roleId: {
          businessType: "retail",
          roleId: role.id,
        },
      },
      update: {},
      create: {
        businessType: "retail",
        roleId: role.id,
        isEnabled: true,
      },
    });
  }

  // Retail: Core permissions only (no kitchen, tables, reservations)
  const retailIncludedPerms = [
    "MANAGE_CATEGORIES",
    "VIEW_CATEGORIES",
    "MANAGE_MENU", // Will be used for products
    "VIEW_MENU",
    "VIEW_ALL_ORDERS",
    "MANAGE_ORDERS",
    "CREATE_ORDER",
    "UPDATE_ORDER_STATUS",
    "PROCESS_PAYMENTS",
    "VIEW_PAYMENTS",
    "MANAGE_SETTINGS",
    "VIEW_SETTINGS",
    "VIEW_ANALYTICS",
    "VIEW_REPORTS",
    "EXPORT_DATA",
    "VIEW_USERS",
    "MANAGE_USERS",
  ];
  for (const permission of allPermissions) {
    if (!retailIncludedPerms.includes(permission.code)) continue;

    await prisma.businessTypePermission.upsert({
      where: {
        businessType_permissionId: {
          businessType: "retail",
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        businessType: "retail",
        permissionId: permission.id,
        isEnabled: true,
      },
    });
  }

  console.log(
    "✅ Business type templates configured (restaurant, cafe, bakery, retail)",
  );

  // ============================================================================
  // 10. Create Retail Demo Tenant
  // ============================================================================
  let retailTenant = await prisma.tenant.findUnique({
    where: { slug: "demo-retail" },
  });

  if (!retailTenant) {
    retailTenant = await prisma.tenant.create({
      data: {
        slug: "demo-retail",
        name: "Toko Sejahtera - Demo Retail",
        businessType: "retail",
        ownerEmail: "owner@tokosejahtera.com",
        ownerName: "Toko Owner",
        plan: "pro",
        isActive: true,
      },
    });
    console.log("✅ Retail tenant created:", retailTenant.slug);

    // Create subscription for retail tenant
    const retailTrialEndsAt = new Date();
    retailTrialEndsAt.setDate(retailTrialEndsAt.getDate() + 30);

    await prisma.subscription.create({
      data: {
        tenantId: retailTenant.id,
        plan: "pro",
        status: "TRIAL",
        trialEndsAt: retailTrialEndsAt,
        currentPeriodStart: new Date(),
        currentPeriodEnd: retailTrialEndsAt,
      },
    });
    console.log("✅ Subscription created for retail tenant");

    // Create admin user for retail
    const retailAdminPasswordHash = await hashPassword("admin123");
    await prisma.adminUser.create({
      data: {
        tenantId: retailTenant.id,
        email: "admin@tokosejahtera.com",
        passwordHash: retailAdminPasswordHash,
        name: "Store Admin",
        role: "OWNER",
        isActive: true,
      },
    });
    console.log("✅ Retail admin user created");

    // Create sample retail users
    const retailUsers = [
      {
        email: "owner@tokosejahtera.com",
        name: "Store Owner",
        role: "OWNER" as const,
        password: "owner123",
        phoneNumber: "+62 821 1111 1111",
      },
      {
        email: "manager@tokosejahtera.com",
        name: "Store Manager",
        role: "MANAGER" as const,
        password: "manager123",
        phoneNumber: "+62 821 2222 2222",
      },
      {
        email: "cashier@tokosejahtera.com",
        name: "Cashier",
        role: "CASHIER" as const,
        password: "cashier123",
        phoneNumber: "+62 821 3333 3333",
      },
      {
        email: "customer@tokosejahtera.com",
        name: "Loyal Customer",
        role: "CUSTOMER" as const,
        password: "customer123",
        phoneNumber: "+62 821 9999 9999",
      },
    ];

    for (const userData of retailUsers) {
      const retailPasswordHash = await hashPassword(userData.password);
      await prisma.user.create({
        data: {
          tenantId: retailTenant.id,
          email: userData.email,
          passwordHash: retailPasswordHash,
          name: userData.name,
          role: userData.role,
          phoneNumber: userData.phoneNumber,
          isActive: true,
        },
      });
      console.log(
        `✅ Retail user created: ${userData.email} (${userData.role})`,
      );
    }

    // Create business info for retail
    await prisma.businessInfo.create({
      data: {
        tenantId: retailTenant.id,
        name: "Toko Sejahtera",
        description:
          "Toko retail modern dengan berbagai produk kebutuhan sehari-hari berkualitas.",
        address: "Jl. Merdeka Raya No. 123\nSurabaya, Jawa Timur 60111",
        phoneNumber: "+62 821 9876 5432",
        email: "info@tokosejahtera.com",
        mapsUrl: "https://maps.google.com/",
        metadata: {
          openingHours: "Senin - Sabtu: 08:00 - 21:00\nMinggu: 09:00 - 18:00",
        },
      },
    });
    console.log("✅ Retail business info created");

    // Create theme config for retail (retail-professional preset)
    await prisma.themeConfig.create({
      data: {
        tenantId: retailTenant.id,
        primaryColor: "#2563eb", // retail-professional theme
        secondaryColor: "#1e40af",
        fontFamily: "Inter",
        layoutVariant: "minimal",
      },
    });
    console.log("✅ Retail theme config created (retail-professional)");

    // Create sample product categories
    const retailCategories = [
      {
        name: "Makanan & Minuman",
        slug: "makanan-minuman",
      },
      {
        name: "Kebutuhan Rumah Tangga",
        slug: "rumah-tangga",
      },
      {
        name: "Kesehatan & Kecantikan",
        slug: "kesehatan-kecantikan",
      },
      {
        name: "Elektronik",
        slug: "elektronik",
      },
    ];

    const createdRetailCategories = [];
    for (const cat of retailCategories) {
      const category = await prisma.category.create({
        data: {
          tenantId: retailTenant.id,
          name: cat.name,
          slug: cat.slug,
          isActive: true,
          sortOrder: 0,
        },
      });
      createdRetailCategories.push(category);
    }
    console.log("✅ Retail categories created");

    // Create sample products (using MenuItem model)
    const retailProducts = [
      {
        categoryId: createdRetailCategories[0].id, // Makanan & Minuman
        name: "Indomie Goreng",
        description: "Mi instan goreng rasa original",
        price: 3500,
        stock: 50,
        sku: "FOOD-001",
        photoUrl:
          "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400",
      },
      {
        categoryId: createdRetailCategories[0].id,
        name: "Aqua 600ml",
        description: "Air mineral kemasan 600ml",
        price: 4000,
        stock: 30,
        sku: "DRINK-001",
        photoUrl:
          "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=400",
      },
      {
        categoryId: createdRetailCategories[1].id, // Rumah Tangga
        name: "Sabun Cuci Piring",
        description: "Sabun cuci piring formula anti bakteri",
        price: 12000,
        stock: 5,
        sku: "HOME-001",
        photoUrl:
          "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400",
      },
      {
        categoryId: createdRetailCategories[2].id, // Kesehatan
        name: "Masker Kesehatan",
        description: "Masker 3 ply isi 10 pcs",
        price: 15000,
        stock: 0,
        sku: "HEALTH-001",
        photoUrl:
          "https://images.unsplash.com/photo-1584370830116-95c1095d7b1a?w=400",
      },
      {
        categoryId: createdRetailCategories[3].id, // Elektronik
        name: "Kabel USB Type-C",
        description: "Kabel charger USB Type-C 1 meter",
        price: 25000,
        stock: 15,
        sku: "ELEC-001",
        photoUrl:
          "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400",
      },
    ];

    for (const product of retailProducts) {
      await prisma.menuItem.create({
        data: {
          tenantId: retailTenant.id,
          categoryId: product.categoryId,
          name: product.name,
          description: product.description,
          price: product.price,
          photoUrl: product.photoUrl,
          stock: product.stock,
          sku: product.sku,
          isAvailable: true,
          isFeatured: false,
        },
      });
    }
    console.log("✅ Retail products created");
  } else {
    console.log("ℹ️  Retail tenant already exists:", retailTenant.slug);
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
