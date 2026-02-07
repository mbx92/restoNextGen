import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed initial feature categories
 */
async function seedCategories() {
  console.log('🌱 Seeding feature categories...');

  const categories = [
    {
      code: 'branding',
      name: 'Branding',
      description: 'Branding and customization features',
      icon: 'i-lucide-palette',
      sortOrder: 1,
    },
    {
      code: 'analytics',
      name: 'Analytics',
      description: 'Analytics and reporting features',
      icon: 'i-lucide-bar-chart-3',
      sortOrder: 2,
    },
    {
      code: 'integrations',
      name: 'Integrations',
      description: 'Third-party integrations and API access',
      icon: 'i-lucide-plug',
      sortOrder: 3,
    },
    {
      code: 'support',
      name: 'Support',
      description: 'Customer support and service features',
      icon: 'i-lucide-headphones',
      sortOrder: 4,
    },
    {
      code: 'advanced',
      name: 'Advanced',
      description: 'Advanced and enterprise features',
      icon: 'i-lucide-zap',
      sortOrder: 5,
    },
    {
      code: 'general',
      name: 'General',
      description: 'General platform features',
      icon: 'i-lucide-settings',
      sortOrder: 99,
    },
  ];

  for (const category of categories) {
    await prisma.featureCategory.upsert({
      where: { code: category.code },
      update: category,
      create: category,
    });
  }

  console.log(`✅ Created/updated ${categories.length} categories`);
}

/**
 * Update existing features to link to categories
 */
async function linkFeaturesToCategories() {
  console.log('🔗 Linking features to categories...');

  // Get all categories
  const categories = await prisma.featureCategory.findMany();
  const categoryMap = new Map(categories.map(c => [c.code, c.id]));

  // Map of feature codes to category codes (based on existing data)
  const featureCategoryMapping: Record<string, string> = {
    // Branding
    CUSTOM_DOMAIN: 'branding',
    WHITE_LABEL: 'branding',
    CUSTOM_BRANDING: 'branding',
    
    // Analytics
    ADVANCED_ANALYTICS: 'analytics',
    CUSTOM_REPORTS: 'analytics',
    
    // Integrations
    API_ACCESS: 'integrations',
    WEBHOOKS: 'integrations',
    SSO: 'integrations',
    
    // Support
    PRIORITY_SUPPORT: 'support',
    DEDICATED_ACCOUNT_MANAGER: 'support',
    SLA_99_9: 'support',
    
    // Advanced
    UNLIMITED_USERS: 'advanced',
    CUSTOM_INTEGRATIONS: 'advanced',
    AUDIT_LOGS: 'advanced',
    ROLE_BASED_ACCESS: 'advanced',
    DATA_EXPORT: 'advanced',
    CONTENT_MANAGEMENT_SERVICE: 'advanced',
  };

  // Update features
  for (const [featureCode, categoryCode] of Object.entries(featureCategoryMapping)) {
    const categoryId = categoryMap.get(categoryCode);
    if (!categoryId) {
      console.warn(`⚠️  Category ${categoryCode} not found for feature ${featureCode}`);
      continue;
    }

    try {
      await prisma.feature.updateMany({
        where: { code: featureCode },
        data: { categoryId },
      });
      console.log(`  ✓ Linked ${featureCode} → ${categoryCode}`);
    } catch (error) {
      console.warn(`  ⚠️  Could not link ${featureCode}:`, error);
    }
  }

  console.log('✅ Features linked to categories');
}

async function main() {
  try {
    await seedCategories();
    await linkFeaturesToCategories();
    console.log('🎉 Category seeding complete!');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
