-- CreateTable: FeatureCategory
CREATE TABLE "feature_category" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "feature_category_code_key" ON "feature_category"("code");

-- CreateIndex
CREATE INDEX "feature_category_code_idx" ON "feature_category"("code");

-- CreateIndex
CREATE INDEX "feature_category_sortOrder_idx" ON "feature_category"("sortOrder");

-- Data Migration: Insert categories from existing feature.category values
INSERT INTO "feature_category" ("id", "code", "name", "description", "sortOrder", "createdAt", "updatedAt")
SELECT 
    'cat_' || LOWER(REPLACE(category, ' ', '_')) || '_' || substr(md5(random()::text), 1, 8),
    LOWER(REPLACE(category, ' ', '_')),
    INITCAP(category),
    'Category for ' || category || ' features',
    CASE 
        WHEN category = 'branding' THEN 1
        WHEN category = 'analytics' THEN 2
        WHEN category = 'integrations' THEN 3
        WHEN category = 'support' THEN 4
        WHEN category = 'advanced' THEN 5
        ELSE 99
    END,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM (
    SELECT DISTINCT category FROM "feature" WHERE category IS NOT NULL
) AS distinct_categories;

-- AlterTable: Add categoryId column to feature table
ALTER TABLE "feature" ADD COLUMN "categoryId" TEXT;

-- Data Migration: Update feature records to reference category IDs
UPDATE "feature" f
SET "categoryId" = fc.id
FROM "feature_category" fc
WHERE LOWER(REPLACE(f.category, ' ', '_')) = fc.code;

-- DropIndex: Remove old category index
DROP INDEX IF EXISTS "feature_category_idx";

-- AlterTable: Drop old category column
ALTER TABLE "feature" DROP COLUMN "category";

-- CreateIndex: Add index for new categoryId
CREATE INDEX "feature_categoryId_idx" ON "feature"("categoryId");

-- AddForeignKey
ALTER TABLE "feature" ADD CONSTRAINT "feature_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "feature_category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
