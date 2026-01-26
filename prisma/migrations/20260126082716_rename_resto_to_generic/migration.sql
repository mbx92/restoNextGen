-- Rename tables from resto_* to generic names
-- This preserves all existing data

-- Rename tables
ALTER TABLE "resto_category" RENAME TO "category";
ALTER TABLE "resto_menu_item" RENAME TO "item";
ALTER TABLE "resto_table" RENAME TO "resource_table";
ALTER TABLE "resto_reservation" RENAME TO "reservation";
ALTER TABLE "resto_order" RENAME TO "order";
ALTER TABLE "resto_order_item" RENAME TO "order_item";
ALTER TABLE "resto_payment" RENAME TO "payment";

-- Rename primary key constraints
ALTER INDEX "resto_category_pkey" RENAME TO "category_pkey";
ALTER INDEX "resto_menu_item_pkey" RENAME TO "item_pkey";
ALTER INDEX "resto_table_pkey" RENAME TO "resource_table_pkey";
ALTER INDEX "resto_reservation_pkey" RENAME TO "reservation_pkey";
ALTER INDEX "resto_order_pkey" RENAME TO "order_pkey";
ALTER INDEX "resto_order_item_pkey" RENAME TO "order_item_pkey";
ALTER INDEX "resto_payment_pkey" RENAME TO "payment_pkey";

-- Rename unique constraints
ALTER INDEX "resto_category_tenantId_slug_key" RENAME TO "category_tenantId_slug_key";
ALTER INDEX "resto_table_tenantId_tableCode_key" RENAME TO "resource_table_tenantId_tableCode_key";
ALTER INDEX "resto_order_tenantId_orderNumber_key" RENAME TO "order_tenantId_orderNumber_key";

-- Rename indexes for category
ALTER INDEX "resto_category_tenantId_idx" RENAME TO "category_tenantId_idx";

-- Rename indexes for item (menu_item)
ALTER INDEX "resto_menu_item_tenantId_idx" RENAME TO "item_tenantId_idx";
ALTER INDEX "resto_menu_item_categoryId_idx" RENAME TO "item_categoryId_idx";
ALTER INDEX "resto_menu_item_isFeatured_idx" RENAME TO "item_isFeatured_idx";

-- Rename indexes for resource_table (table)
ALTER INDEX "resto_table_tenantId_idx" RENAME TO "resource_table_tenantId_idx";

-- Rename indexes for reservation
ALTER INDEX "resto_reservation_tenantId_idx" RENAME TO "reservation_tenantId_idx";
ALTER INDEX "resto_reservation_tableId_idx" RENAME TO "reservation_tableId_idx";
ALTER INDEX "resto_reservation_userId_idx" RENAME TO "reservation_userId_idx";
ALTER INDEX "resto_reservation_status_idx" RENAME TO "reservation_status_idx";
ALTER INDEX "resto_reservation_startAt_idx" RENAME TO "reservation_startAt_idx";

-- Rename indexes for order
ALTER INDEX "resto_order_tenantId_idx" RENAME TO "order_tenantId_idx";
ALTER INDEX "resto_order_tableId_idx" RENAME TO "order_tableId_idx";
ALTER INDEX "resto_order_reservationId_idx" RENAME TO "order_reservationId_idx";
ALTER INDEX "resto_order_userId_idx" RENAME TO "order_userId_idx";
ALTER INDEX "resto_order_status_idx" RENAME TO "order_status_idx";
ALTER INDEX "resto_order_type_idx" RENAME TO "order_type_idx";

-- Rename indexes for order_item
ALTER INDEX "resto_order_item_orderId_idx" RENAME TO "order_item_orderId_idx";
ALTER INDEX "resto_order_item_menuItemId_idx" RENAME TO "order_item_menuItemId_idx";

-- Rename indexes for payment
ALTER INDEX "resto_payment_tenantId_idx" RENAME TO "payment_tenantId_idx";
ALTER INDEX "resto_payment_orderId_idx" RENAME TO "payment_orderId_idx";
ALTER INDEX "resto_payment_status_idx" RENAME TO "payment_status_idx";

-- Rename foreign key constraints for category
ALTER TABLE "category" RENAME CONSTRAINT "resto_category_tenantId_fkey" TO "category_tenantId_fkey";

-- Rename foreign key constraints for item
ALTER TABLE "item" RENAME CONSTRAINT "resto_menu_item_tenantId_fkey" TO "item_tenantId_fkey";
ALTER TABLE "item" RENAME CONSTRAINT "resto_menu_item_categoryId_fkey" TO "item_categoryId_fkey";

-- Rename foreign key constraints for resource_table
ALTER TABLE "resource_table" RENAME CONSTRAINT "resto_table_tenantId_fkey" TO "resource_table_tenantId_fkey";

-- Rename foreign key constraints for reservation
ALTER TABLE "reservation" RENAME CONSTRAINT "resto_reservation_tenantId_fkey" TO "reservation_tenantId_fkey";
ALTER TABLE "reservation" RENAME CONSTRAINT "resto_reservation_tableId_fkey" TO "reservation_tableId_fkey";
ALTER TABLE "reservation" RENAME CONSTRAINT "resto_reservation_userId_fkey" TO "reservation_userId_fkey";

-- Rename foreign key constraints for order
ALTER TABLE "order" RENAME CONSTRAINT "resto_order_tenantId_fkey" TO "order_tenantId_fkey";
ALTER TABLE "order" RENAME CONSTRAINT "resto_order_tableId_fkey" TO "order_tableId_fkey";
ALTER TABLE "order" RENAME CONSTRAINT "resto_order_reservationId_fkey" TO "order_reservationId_fkey";
ALTER TABLE "order" RENAME CONSTRAINT "resto_order_userId_fkey" TO "order_userId_fkey";

-- Rename foreign key constraints for order_item
ALTER TABLE "order_item" RENAME CONSTRAINT "resto_order_item_orderId_fkey" TO "order_item_orderId_fkey";
ALTER TABLE "order_item" RENAME CONSTRAINT "resto_order_item_menuItemId_fkey" TO "order_item_menuItemId_fkey";

-- Rename foreign key constraints for payment
ALTER TABLE "payment" RENAME CONSTRAINT "resto_payment_tenantId_fkey" TO "payment_tenantId_fkey";
ALTER TABLE "payment" RENAME CONSTRAINT "resto_payment_orderId_fkey" TO "payment_orderId_fkey";
