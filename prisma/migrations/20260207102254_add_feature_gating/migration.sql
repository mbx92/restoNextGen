-- CreateTable
CREATE TABLE "feature" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "feature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plan_feature" (
    "planId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "plan_feature_pkey" PRIMARY KEY ("planId","featureId")
);

-- CreateTable
CREATE TABLE "tenant_feature_override" (
    "tenantId" TEXT NOT NULL,
    "featureId" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_feature_override_pkey" PRIMARY KEY ("tenantId","featureId")
);

-- CreateIndex
CREATE UNIQUE INDEX "feature_code_key" ON "feature"("code");

-- CreateIndex
CREATE INDEX "feature_code_idx" ON "feature"("code");

-- CreateIndex
CREATE INDEX "feature_category_idx" ON "feature"("category");

-- CreateIndex
CREATE INDEX "plan_feature_planId_idx" ON "plan_feature"("planId");

-- CreateIndex
CREATE INDEX "plan_feature_featureId_idx" ON "plan_feature"("featureId");

-- CreateIndex
CREATE INDEX "tenant_feature_override_tenantId_idx" ON "tenant_feature_override"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_feature_override_featureId_idx" ON "tenant_feature_override"("featureId");

-- AddForeignKey
ALTER TABLE "plan_feature" ADD CONSTRAINT "plan_feature_planId_fkey" FOREIGN KEY ("planId") REFERENCES "plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plan_feature" ADD CONSTRAINT "plan_feature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_feature_override" ADD CONSTRAINT "tenant_feature_override_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_feature_override" ADD CONSTRAINT "tenant_feature_override_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "feature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
