/*
  Warnings:

  - You are about to drop the `AdminUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FeaturedMenuItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LandingHero` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MenuItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reservation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RestaurantInfo` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SiteSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Table` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_reservationId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_tableId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Reservation" DROP CONSTRAINT "Reservation_tableId_fkey";

-- DropTable
DROP TABLE "AdminUser";

-- DropTable
DROP TABLE "Category";

-- DropTable
DROP TABLE "FeaturedMenuItem";

-- DropTable
DROP TABLE "LandingHero";

-- DropTable
DROP TABLE "MenuItem";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Reservation";

-- DropTable
DROP TABLE "RestaurantInfo";

-- DropTable
DROP TABLE "Review";

-- DropTable
DROP TABLE "SiteSettings";

-- DropTable
DROP TABLE "Table";

-- CreateTable
CREATE TABLE "tenant" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'free',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_info" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "address" TEXT,
    "phoneNumber" TEXT,
    "email" TEXT,
    "mapsUrl" TEXT,
    "mapsEmbedUrl" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_info_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "theme_config" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#16a34a',
    "secondaryColor" TEXT NOT NULL DEFAULT '#ca8a04',
    "fontFamily" TEXT NOT NULL DEFAULT 'Inter',
    "layoutVariant" TEXT NOT NULL DEFAULT 'default',
    "customCss" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "theme_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_user" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resto_category" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resto_category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resto_menu_item" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resto_menu_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resto_table" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tableCode" TEXT NOT NULL,
    "name" TEXT,
    "capacity" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resto_table_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resto_reservation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "tableId" TEXT,
    "customerName" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "partySize" INTEGER NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resto_reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resto_order" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PLACED',
    "tableId" TEXT,
    "reservationId" TEXT,
    "customerName" TEXT,
    "customerPhone" TEXT,
    "notes" TEXT,
    "subtotal" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resto_order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resto_order_item" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "menuItemId" TEXT NOT NULL,
    "nameSnapshot" TEXT NOT NULL,
    "priceSnapshot" INTEGER NOT NULL,
    "qty" INTEGER NOT NULL,
    "notes" TEXT,
    "lineTotal" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resto_order_item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resto_payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL DEFAULT 'MIDTRANS',
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "providerRef" TEXT,
    "providerPayload" JSONB,
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resto_payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "landing_hero" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "ctaText" TEXT NOT NULL,
    "ctaLink" TEXT NOT NULL,
    "promoText" TEXT,
    "imageUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "landing_hero_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "site_settings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "logoUrl" TEXT,
    "logoText" TEXT,
    "facebookUrl" TEXT,
    "instagramUrl" TEXT,
    "twitterUrl" TEXT,
    "copyrightText" TEXT,
    "footerLinks" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "business_info_tenantId_key" ON "business_info"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "theme_config_tenantId_key" ON "theme_config"("tenantId");

-- CreateIndex
CREATE INDEX "admin_user_email_idx" ON "admin_user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_user_tenantId_email_key" ON "admin_user"("tenantId", "email");

-- CreateIndex
CREATE INDEX "resto_category_tenantId_idx" ON "resto_category"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "resto_category_tenantId_slug_key" ON "resto_category"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "resto_menu_item_tenantId_idx" ON "resto_menu_item"("tenantId");

-- CreateIndex
CREATE INDEX "resto_menu_item_categoryId_idx" ON "resto_menu_item"("categoryId");

-- CreateIndex
CREATE INDEX "resto_menu_item_isFeatured_idx" ON "resto_menu_item"("isFeatured");

-- CreateIndex
CREATE INDEX "resto_table_tenantId_idx" ON "resto_table"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "resto_table_tenantId_tableCode_key" ON "resto_table"("tenantId", "tableCode");

-- CreateIndex
CREATE INDEX "resto_reservation_tenantId_idx" ON "resto_reservation"("tenantId");

-- CreateIndex
CREATE INDEX "resto_reservation_tableId_idx" ON "resto_reservation"("tableId");

-- CreateIndex
CREATE INDEX "resto_reservation_status_idx" ON "resto_reservation"("status");

-- CreateIndex
CREATE INDEX "resto_reservation_startAt_idx" ON "resto_reservation"("startAt");

-- CreateIndex
CREATE INDEX "resto_order_tenantId_idx" ON "resto_order"("tenantId");

-- CreateIndex
CREATE INDEX "resto_order_tableId_idx" ON "resto_order"("tableId");

-- CreateIndex
CREATE INDEX "resto_order_reservationId_idx" ON "resto_order"("reservationId");

-- CreateIndex
CREATE INDEX "resto_order_status_idx" ON "resto_order"("status");

-- CreateIndex
CREATE INDEX "resto_order_type_idx" ON "resto_order"("type");

-- CreateIndex
CREATE UNIQUE INDEX "resto_order_tenantId_orderNumber_key" ON "resto_order"("tenantId", "orderNumber");

-- CreateIndex
CREATE INDEX "resto_order_item_orderId_idx" ON "resto_order_item"("orderId");

-- CreateIndex
CREATE INDEX "resto_order_item_menuItemId_idx" ON "resto_order_item"("menuItemId");

-- CreateIndex
CREATE INDEX "resto_payment_tenantId_idx" ON "resto_payment"("tenantId");

-- CreateIndex
CREATE INDEX "resto_payment_orderId_idx" ON "resto_payment"("orderId");

-- CreateIndex
CREATE INDEX "resto_payment_status_idx" ON "resto_payment"("status");

-- CreateIndex
CREATE INDEX "review_tenantId_idx" ON "review"("tenantId");

-- CreateIndex
CREATE INDEX "review_isPublished_idx" ON "review"("isPublished");

-- CreateIndex
CREATE INDEX "review_isFeatured_idx" ON "review"("isFeatured");

-- CreateIndex
CREATE INDEX "review_rating_idx" ON "review"("rating");

-- CreateIndex
CREATE INDEX "landing_hero_tenantId_idx" ON "landing_hero"("tenantId");

-- CreateIndex
CREATE INDEX "site_settings_tenantId_idx" ON "site_settings"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "site_settings_tenantId_key_key" ON "site_settings"("tenantId", "key");

-- AddForeignKey
ALTER TABLE "business_info" ADD CONSTRAINT "business_info_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "theme_config" ADD CONSTRAINT "theme_config_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_user" ADD CONSTRAINT "admin_user_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_category" ADD CONSTRAINT "resto_category_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_menu_item" ADD CONSTRAINT "resto_menu_item_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_menu_item" ADD CONSTRAINT "resto_menu_item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "resto_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_table" ADD CONSTRAINT "resto_table_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_reservation" ADD CONSTRAINT "resto_reservation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_reservation" ADD CONSTRAINT "resto_reservation_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "resto_table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_order" ADD CONSTRAINT "resto_order_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_order" ADD CONSTRAINT "resto_order_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "resto_table"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_order" ADD CONSTRAINT "resto_order_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "resto_reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_order_item" ADD CONSTRAINT "resto_order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "resto_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_order_item" ADD CONSTRAINT "resto_order_item_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "resto_menu_item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_payment" ADD CONSTRAINT "resto_payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resto_payment" ADD CONSTRAINT "resto_payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "resto_order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "landing_hero" ADD CONSTRAINT "landing_hero_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
