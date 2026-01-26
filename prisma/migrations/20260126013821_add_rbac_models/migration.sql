-- CreateTable
CREATE TABLE "permission" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hierarchy" INTEGER NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_permission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "role_permission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "business_type_role" (
    "id" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_type_role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_type_permission" (
    "id" TEXT NOT NULL,
    "businessType" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "business_type_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_permission_override" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "roleCode" TEXT NOT NULL,
    "isGranted" BOOLEAN NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_permission_override_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_code_key" ON "permission"("code");

-- CreateIndex
CREATE INDEX "permission_category_idx" ON "permission"("category");

-- CreateIndex
CREATE INDEX "permission_isSystem_idx" ON "permission"("isSystem");

-- CreateIndex
CREATE UNIQUE INDEX "role_code_key" ON "role"("code");

-- CreateIndex
CREATE INDEX "role_hierarchy_idx" ON "role"("hierarchy");

-- CreateIndex
CREATE INDEX "role_isSystem_idx" ON "role"("isSystem");

-- CreateIndex
CREATE INDEX "role_permission_roleId_idx" ON "role_permission"("roleId");

-- CreateIndex
CREATE INDEX "role_permission_permissionId_idx" ON "role_permission"("permissionId");

-- CreateIndex
CREATE INDEX "business_type_role_businessType_idx" ON "business_type_role"("businessType");

-- CreateIndex
CREATE INDEX "business_type_role_roleId_idx" ON "business_type_role"("roleId");

-- CreateIndex
CREATE UNIQUE INDEX "business_type_role_businessType_roleId_key" ON "business_type_role"("businessType", "roleId");

-- CreateIndex
CREATE INDEX "business_type_permission_businessType_idx" ON "business_type_permission"("businessType");

-- CreateIndex
CREATE INDEX "business_type_permission_permissionId_idx" ON "business_type_permission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "business_type_permission_businessType_permissionId_key" ON "business_type_permission"("businessType", "permissionId");

-- CreateIndex
CREATE INDEX "tenant_permission_override_tenantId_idx" ON "tenant_permission_override"("tenantId");

-- CreateIndex
CREATE INDEX "tenant_permission_override_permissionId_idx" ON "tenant_permission_override"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_permission_override_tenantId_permissionId_roleCode_key" ON "tenant_permission_override"("tenantId", "permissionId", "roleCode");

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_permission" ADD CONSTRAINT "role_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_type_role" ADD CONSTRAINT "business_type_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_type_permission" ADD CONSTRAINT "business_type_permission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_permission_override" ADD CONSTRAINT "tenant_permission_override_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_permission_override" ADD CONSTRAINT "tenant_permission_override_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
