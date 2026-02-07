import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedPlans() {
  console.log("🌱 Seeding default plans...");

  const plans = [
    {
      name: "Free",
      slug: "free",
      description: "Perfect for trying out the platform",
      price: 0,
      billingInterval: "month",
      features: [
        "1 location",
        "Up to 20 menu items",
        "Up to 5 tables",
        "Basic reporting",
        "Email support",
      ],
      limits: {
        menuItems: 20,
        tables: 5,
        orders: 100,
        users: 2,
        storage: 100, // MB
      },
      isActive: true,
      sortOrder: 1,
    },
    {
      name: "Starter",
      slug: "starter",
      description: "Great for small businesses",
      price: 29900, // $299/month
      billingInterval: "month",
      features: [
        "1 location",
        "Up to 100 menu items",
        "Up to 20 tables",
        "Advanced reporting",
        "QR code ordering",
        "Priority email support",
        "Custom branding",
      ],
      limits: {
        menuItems: 100,
        tables: 20,
        orders: 1000,
        users: 5,
        storage: 1000, // 1GB
      },
      isActive: true,
      sortOrder: 2,
    },
    {
      name: "Professional",
      slug: "pro",
      description: "For growing businesses",
      price: 79900, // $799/month
      billingInterval: "month",
      features: [
        "Up to 3 locations",
        "Unlimited menu items",
        "Unlimited tables",
        "Advanced analytics",
        "QR code ordering",
        "Online reservations",
        "Inventory management",
        "Custom domain",
        "24/7 chat support",
        "API access",
      ],
      limits: {
        menuItems: -1, // unlimited
        tables: -1,
        orders: -1,
        users: 20,
        storage: 10000, // 10GB
        locations: 3,
      },
      isActive: true,
      sortOrder: 3,
    },
    {
      name: "Enterprise",
      slug: "enterprise",
      description: "For large organizations",
      price: 0, // Custom pricing
      billingInterval: "month",
      features: [
        "Unlimited locations",
        "Unlimited everything",
        "Dedicated account manager",
        "Custom integrations",
        "White-label solution",
        "SLA guarantee",
        "Advanced security",
        "Custom training",
        "Priority feature requests",
      ],
      limits: {
        menuItems: -1,
        tables: -1,
        orders: -1,
        users: -1,
        storage: -1,
        locations: -1,
      },
      isActive: true,
      sortOrder: 4,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { slug: plan.slug },
      update: plan,
      create: plan,
    });
    console.log(`✅ Created/Updated plan: ${plan.name}`);
  }

  // Update existing subscriptions to use planId
  console.log("\n🔄 Migrating existing subscriptions...");

  const subscriptions = await prisma.subscription.findMany({
    where: { planId: null },
  });

  for (const sub of subscriptions) {
    const planSlug = sub.plan || "free";
    const plan = await prisma.plan.findUnique({
      where: { slug: planSlug },
    });

    if (plan) {
      await prisma.subscription.update({
        where: { id: sub.id },
        data: { planId: plan.id },
      });
      console.log(`✅ Migrated subscription ${sub.id} to plan ${plan.name}`);
    }
  }

  console.log("\n✨ Plans seeded successfully!");
}

async function seedFeatures() {
  console.log("\n🎯 Seeding features...");

  const features = [
    // Branding features
    {
      code: "CUSTOM_DOMAIN",
      name: "Custom Domain",
      description: "Use your own domain name",
      sortOrder: 1,
    },
    {
      code: "CUSTOM_BRANDING",
      name: "Custom Branding",
      description: "Customize colors, fonts, and logo",
      sortOrder: 2,
    },
    {
      code: "WHITE_LABEL",
      name: "White Label",
      description: "Remove all platform branding",
      sortOrder: 3,
    },

    // Analytics features
    {
      code: "BASIC_REPORTING",
      name: "Basic Reporting",
      description: "Sales and order reports",
      sortOrder: 1,
    },
    {
      code: "ADVANCED_ANALYTICS",
      name: "Advanced Analytics",
      description: "Detailed insights and trends",
      sortOrder: 2,
    },
    {
      code: "REAL_TIME_DASHBOARD",
      name: "Real-time Dashboard",
      description: "Live metrics and KPIs",
      sortOrder: 3,
    },

    // Integration features
    {
      code: "API_ACCESS",
      name: "API Access",
      description: "RESTful API for integrations",
      sortOrder: 1,
    },
    {
      code: "WEBHOOKS",
      name: "Webhooks",
      description: "Event-driven integrations",
      sortOrder: 2,
    },
    {
      code: "THIRD_PARTY_INTEGRATIONS",
      name: "Third-party Integrations",
      description: "Connect with accounting, CRM, etc.",
      sortOrder: 3,
    },

    // Support features
    {
      code: "EMAIL_SUPPORT",
      name: "Email Support",
      description: "Support via email",
      sortOrder: 1,
    },
    {
      code: "PRIORITY_SUPPORT",
      name: "Priority Support",
      description: "Faster response times",
      sortOrder: 2,
    },
    {
      code: "DEDICATED_ACCOUNT_MANAGER",
      name: "Dedicated Account Manager",
      description: "Personal account manager",
      sortOrder: 3,
    },

    // Advanced features
    {
      code: "MULTI_LOCATION",
      name: "Multi-location",
      description: "Manage multiple locations",
      sortOrder: 1,
    },
    {
      code: "INVENTORY_MANAGEMENT",
      name: "Inventory Management",
      description: "Track stock and suppliers",
      sortOrder: 2,
    },
    {
      code: "STAFF_MANAGEMENT",
      name: "Staff Management",
      description: "Employee scheduling and payroll",
      sortOrder: 3,
    },
    {
      code: "CUSTOM_WORKFLOWS",
      name: "Custom Workflows",
      description: "Create custom business processes",
      sortOrder: 4,
    },
    {
      code: "CONTENT_MANAGEMENT_SERVICE",
      name: "Content Management Service",
      description: "Manage landing page, featured menu, reviews, and location",
      sortOrder: 5,
    },
  ];

  for (const feature of features) {
    await prisma.feature.upsert({
      where: { code: feature.code },
      update: feature,
      create: feature,
    });
    console.log(`✅ Created/Updated feature: ${feature.name}`);
  }

  console.log("\n🔗 Mapping features to plans...");

  // Get all plans
  const freePlan = await prisma.plan.findUnique({ where: { slug: "free" } });
  const starterPlan = await prisma.plan.findUnique({
    where: { slug: "starter" },
  });
  const proPlan = await prisma.plan.findUnique({ where: { slug: "pro" } });
  const enterprisePlan = await prisma.plan.findUnique({
    where: { slug: "enterprise" },
  });

  if (!freePlan || !starterPlan || !proPlan || !enterprisePlan) {
    throw new Error("Plans not found. Run seedPlans() first.");
  }

  // Get features
  const getFeature = async (code: string) => {
    const feature = await prisma.feature.findUnique({ where: { code } });
    if (!feature) throw new Error(`Feature ${code} not found`);
    return feature;
  };

  // Free Plan features
  const freePlanFeatures = [
    await getFeature("BASIC_REPORTING"),
    await getFeature("EMAIL_SUPPORT"),
  ];

  for (const feature of freePlanFeatures) {
    await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId: freePlan.id,
          featureId: feature.id,
        },
      },
      update: { enabled: true },
      create: {
        planId: freePlan.id,
        featureId: feature.id,
        enabled: true,
      },
    });
  }
  console.log(`✅ Mapped ${freePlanFeatures.length} features to Free plan`);

  // Starter Plan features
  const starterPlanFeatures = [
    await getFeature("BASIC_REPORTING"),
    await getFeature("ADVANCED_ANALYTICS"),
    await getFeature("CUSTOM_BRANDING"),
    await getFeature("EMAIL_SUPPORT"),
    await getFeature("PRIORITY_SUPPORT"),
    await getFeature("CONTENT_MANAGEMENT_SERVICE"),
  ];

  for (const feature of starterPlanFeatures) {
    await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId: starterPlan.id,
          featureId: feature.id,
        },
      },
      update: { enabled: true },
      create: {
        planId: starterPlan.id,
        featureId: feature.id,
        enabled: true,
      },
    });
  }
  console.log(
    `✅ Mapped ${starterPlanFeatures.length} features to Starter plan`,
  );

  // Pro Plan features
  const proPlanFeatures = [
    await getFeature("BASIC_REPORTING"),
    await getFeature("ADVANCED_ANALYTICS"),
    await getFeature("REAL_TIME_DASHBOARD"),
    await getFeature("CUSTOM_BRANDING"),
    await getFeature("CUSTOM_DOMAIN"),
    await getFeature("MULTI_LOCATION"),
    await getFeature("INVENTORY_MANAGEMENT"),
    await getFeature("API_ACCESS"),
    await getFeature("EMAIL_SUPPORT"),
    await getFeature("PRIORITY_SUPPORT"),
    await getFeature("CONTENT_MANAGEMENT_SERVICE"),
  ];

  for (const feature of proPlanFeatures) {
    await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId: proPlan.id,
          featureId: feature.id,
        },
      },
      update: { enabled: true },
      create: {
        planId: proPlan.id,
        featureId: feature.id,
        enabled: true,
      },
    });
  }
  console.log(`✅ Mapped ${proPlanFeatures.length} features to Pro plan`);

  // Enterprise Plan - all features
  const allFeatures = await prisma.feature.findMany();
  for (const feature of allFeatures) {
    await prisma.planFeature.upsert({
      where: {
        planId_featureId: {
          planId: enterprisePlan.id,
          featureId: feature.id,
        },
      },
      update: { enabled: true },
      create: {
        planId: enterprisePlan.id,
        featureId: feature.id,
        enabled: true,
      },
    });
  }
  console.log(`✅ Mapped ${allFeatures.length} features to Enterprise plan`);

  console.log("\n✨ Features seeded successfully!");
}

async function main() {
  await seedPlans();
  await seedFeatures();
}

main()
  .catch((e) => {
    console.error("❌ Error seeding plans:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
