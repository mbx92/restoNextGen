import { PrismaClient } from "@prisma/client";
import { hash } from "bcrypt";

const prisma = new PrismaClient();

async function hashPassword(password: string): Promise<string> {
  return hash(password, 10);
}

async function main() {
  console.log("🌱 Seeding database...");

  // Create default admin user if not exists
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: "admin@wrpadi.com" },
  });

  if (!existingAdmin) {
    const passwordHash = await hashPassword("admin123");
    const admin = await prisma.adminUser.create({
      data: {
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

  // Restaurant Info
  const existingInfo = await prisma.restaurantInfo.findFirst();
  if (!existingInfo) {
    await prisma.restaurantInfo.create({
      data: {
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
        openingHours:
          "Monday - Friday: 10:00 - 22:00\nSaturday - Sunday: 09:00 - 23:00",
      },
    });
    console.log("✅ Restaurant info created");
  }

  // Landing Hero
  const existingHero = await prisma.landingHero.findFirst();
  if (!existingHero) {
    await prisma.landingHero.create({
      data: {
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

  // Sample Reviews
  const existingReviews = await prisma.review.count();
  if (existingReviews === 0) {
    await prisma.review.createMany({
      data: [
        {
          authorName: "Budi Santoso",
          rating: 5,
          comment:
            "Sup ikan salmon terbaik yang pernah saya coba! Kuahnya segar dan ikannya sangat lembut.",
          isPublished: true,
          isFeatured: true,
        },
        {
          authorName: "Sarah Williams",
          rating: 5,
          comment:
            "The salmon soup is absolutely delicious. The atmosphere is cozy and the service is excellent!",
          isPublished: true,
          isFeatured: true,
        },
        {
          authorName: "Indra Wijaya",
          rating: 4,
          comment:
            "Rasanya enak, porsinya juga pas. Recommended untuk pecinta seafood!",
          isPublished: true,
          isFeatured: true,
        },
        {
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

  // Site Settings (Header & Footer)
  const existingHeader = await prisma.siteSettings.findUnique({
    where: { key: "header" },
  });
  if (!existingHeader) {
    await prisma.siteSettings.create({
      data: {
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
    where: { key: "footer" },
  });
  if (!existingFooter) {
    await prisma.siteSettings.create({
      data: {
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
