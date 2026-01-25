# SaaS Multi-Tenant Implementation Roadmap

## Overview

Dokumen ini menjelaskan langkah-langkah untuk mentransformasi aplikasi restaurant single-tenant menjadi platform SaaS multi-tenant yang dapat mendukung berbagai jenis bisnis (restaurant, retail, salon, dll).

### Goals

- Memisahkan schema menjadi **BASE (CMS)** dan **MODULE (business-specific)**
- Mendukung multiple tenants dengan row-level tenancy
- Memungkinkan tenant memilih business type saat onboarding
- Menyediakan theme customization per tenant

### Architecture Decision

- **Table Prefixing** dengan `@@map()` untuk isolasi namespace
- **Modular Prisma Files** untuk code organization
- **Row-Level Tenancy** dengan `tenantId` di setiap table
- **Additive-Only Migrations** untuk production safety

---

## Phase 1: Schema Refactoring (Current Priority)

### 1.1 Tambahkan Tenant Model

Buat model Tenant sebagai core entity untuk multi-tenancy.

```prisma
model Tenant {
  id           String   @id @default(cuid())
  slug         String   @unique  // untuk subdomain/URL: warungpak.yourapp.com
  name         String
  businessType String   // "restaurant", "retail", "salon"
  plan         String   @default("free") // "free", "starter", "pro"
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@map("tenant")
}
```

### 1.2 Buat BusinessInfo (Generik)

Refactor `RestaurantInfo` menjadi generic `BusinessInfo`.

```prisma
model BusinessInfo {
  id          String   @id @default(cuid())
  tenantId    String   @unique
  name        String
  description String?
  address     String?
  phoneNumber String?
  email       String?
  mapsUrl     String?
  metadata    Json?    // Module-specific fields (openingHours, etc)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("business_info")
}
```

### 1.3 Buat ThemeConfig Model

```prisma
model ThemeConfig {
  id             String   @id @default(cuid())
  tenantId       String   @unique
  primaryColor   String   @default("#16a34a")  // green-600
  secondaryColor String   @default("#ca8a04")  // yellow-600
  fontFamily     String   @default("Inter")
  layoutVariant  String   @default("default")  // "default", "minimal", "bold"
  customCss      String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@map("theme_config")
}
```

### 1.4 Tambahkan tenantId ke BASE Models

Update semua existing base models dengan `tenantId` foreign key.

### 1.5 Rename Restaurant Tables dengan Prefix

Gunakan `@@map()` untuk prefix tanpa ubah model name di code:

| Model       | Database Table      |
| ----------- | ------------------- |
| Category    | `resto_category`    |
| MenuItem    | `resto_menu_item`   |
| Table       | `resto_table`       |
| Order       | `resto_order`       |
| OrderItem   | `resto_order_item`  |
| Reservation | `resto_reservation` |
| Payment     | `resto_payment`     |

### 1.6 Jalankan Migration

```bash
# Reset database (HANYA DI DEVELOPMENT!)
npx prisma migrate reset

# Atau buat migration baru
npx prisma migrate dev --name multi_tenant_schema_refactor
```

---

## Phase 2: Tenant Context & Auth Update

### 2.1 Update Auth Session

Session harus include tenant context:

```typescript
interface UserSession {
  user: {
    id: string;
    email: string;
    name: string;
    tenantId: string;
    tenantSlug: string;
    businessType: string;
  };
}
```

### 2.2 Buat Tenant Resolver Middleware

Resolve tenant dari subdomain atau header untuk public pages.

### 2.3 Update Semua API Routes

Setiap query harus filter by `tenantId`.

---

## Phase 3: Business Type Selection & Onboarding

### 3.1 Buat Business Type Registry

**File:** `server/config/business-types.ts`

```typescript
export const businessTypes = {
  restaurant: {
    id: "restaurant",
    name: "Restaurant / Warung Makan",
    description: "Untuk bisnis F&B dengan dine-in dan takeaway",
    icon: "i-heroicons-building-storefront",
    modules: [
      "resto_category",
      "resto_menu_item",
      "resto_table",
      "resto_order",
    ],
  },
  retail: {
    id: "retail",
    name: "Toko Retail",
    description: "Untuk toko dengan inventory dan POS",
    icon: "i-heroicons-shopping-bag",
    modules: ["retail_category", "retail_product", "retail_inventory"],
  },
};
```

### 3.2 Buat Onboarding Flow

**Pages:**

- `pages/onboarding/index.vue` - Business type selection
- `pages/onboarding/setup.vue` - Business details form
- `pages/onboarding/theme.vue` - Theme customization
- `pages/onboarding/complete.vue` - Success & redirect

### 3.3 Tenant Provisioning Service

**File:** `server/services/tenant-provisioning.ts`

---

## Phase 4: Theme System

### 4.1 Load Theme di App

Apply CSS variables dari ThemeConfig per tenant.

### 4.2 Theme API Endpoint

**File:** `server/api/public/theme.get.ts`

---

## Phase 5: Admin Dashboard Updates

### 5.1 Update Admin Navigation

Navigation items harus dynamic berdasarkan `businessType`.

---

## Implementation Checklist

### Phase 1: Schema Refactoring ✅ COMPLETED

- [x] Add `Tenant` model
- [x] Add `BusinessInfo` model (generic)
- [x] Add `ThemeConfig` model
- [x] Add `tenantId` to `AdminUser`
- [x] Add `tenantId` to `SiteSettings`
- [x] Add `tenantId` to `LandingHero`
- [x] Add `tenantId` to `Review`
- [x] Rename `Category` → `@@map("resto_category")`
- [x] Rename `MenuItem` → `@@map("resto_menu_item")`
- [x] Rename `Table` → `@@map("resto_table")`
- [x] Rename `Order` → `@@map("resto_order")`
- [x] Rename `OrderItem` → `@@map("resto_order_item")`
- [x] Rename `Reservation` → `@@map("resto_reservation")`
- [x] Rename `Payment` → `@@map("resto_payment")`
- [x] Run migration (`20260125135631_multi_tenant_schema`)
- [x] Update seed.ts with tenant creation
- [x] Create `server/utils/tenant.ts` helper

### Phase 2: Tenant Context ✅ COMPLETED

- [x] Update auth session structure (login.post.ts)
- [x] Update session.get.ts to include tenant info
- [x] Update public landing.get.ts with tenant resolution
- [x] Update public site-settings.get.ts with tenant resolution
- [x] Update public reviews/submit.post.ts with tenant resolution
- [x] Update admin API routes with tenantId filter:
  - [x] categories/index.get.ts, index.post.ts, [id].patch.ts, [id].delete.ts
  - [x] menu/items.get.ts, items.post.ts, [id].patch.ts, [id].delete.ts
  - [x] reviews/index.get.ts, index.post.ts, [id].put.ts, [id].delete.ts
  - [x] landing/hero.get.ts, hero.post.ts, hero.patch.ts
  - [x] site-settings/[key].get.ts, [key].post.ts
  - [x] restaurant-info/index.get.ts, index.post.ts (migrated to BusinessInfo)
  - [x] dashboard/stats.get.ts
  - [x] featured-menu/index.get.ts

### Phase 2.5: Platform Admin Panel ✅ COMPLETED

- [x] Create `PlatformAdmin` model
- [x] Create `Subscription` model
- [x] Create platform auth middleware (`platform-auth.ts`)
- [x] Create platform layout (`layouts/platform.vue`)
- [x] Create platform login page (`pages/platform/login.vue`)
- [x] Create platform dashboard (`pages/platform/index.vue`)
- [x] Create tenant management:
  - [x] Tenant list page (`pages/platform/tenants/index.vue`)
  - [x] Tenant detail page (`pages/platform/tenants/[id].vue`)
  - [x] Tenant API endpoints (`server/api/platform/tenants/`)
  - [x] Add users to tenant functionality
- [x] Create subscription management:
  - [x] Subscription list page (`pages/platform/subscriptions/index.vue`)
  - [x] Subscription API endpoint (`server/api/platform/subscriptions/`)
- [x] Create platform analytics page (`pages/platform/analytics/`)
- [x] Create platform settings page (`pages/platform/settings/`)
- [x] Create platform stats endpoint (`server/api/platform/stats.get.ts`)
- [x] Platform admin authentication flow
- [x] Platform admin session management

### Phase 3: Onboarding ✅ COMPLETED

- [x] Create business-types.ts config
- [x] Create onboarding pages (index, setup, complete)
- [x] Create tenant-provisioning service
- [x] Create signup/register flow
- [x] Create onboarding API endpoints

### Phase 4: Theme System ✅ COMPLETED

- [x] Create theme API endpoint
- [x] Load theme in app.vue
- [x] Create theme editor in admin

### Phase 5: Admin Dashboard ✅ COMPLETED

- [x] Update navigation to be dynamic
- [x] Add business type indicator
- [x] Create module-specific routes

---

## Production Migration Strategy

Setelah production, ikuti aturan ini:

### Golden Rules

1. **Additive-Only** - Hanya ADD, jangan DROP atau RENAME
2. **Multi-Phase** - EXPAND → MIGRATE → CONTRACT
3. **Always Backfill** - Migrate data sebelum switch
4. **Monitor** - 24h monitoring sebelum lanjut phase

---

## File Structure (Target)

```
prisma/
├── schema.prisma           # Main schema
└── seeds/
    ├── base.seed.ts
    └── restaurant.seed.ts

server/
├── config/
│   └── business-types.ts   # Business type registry
├── services/
│   └── tenant-provisioning.ts
├── middleware/
│   ├── auth.ts
│   └── tenant.ts           # Tenant resolver
└── api/
    ├── admin/              # Tenant-scoped admin APIs
    ├── public/             # Public APIs (with tenant context)
    └── onboarding/         # Signup & provisioning APIs

pages/
├── onboarding/
│   ├── index.vue           # Business type selection
│   ├── setup.vue           # Business details
│   └── complete.vue        # Success
└── admin/
    └── ...                 # Dynamic based on businessType
```

---

## User Management & RBAC Strategy

### Current State (Incomplete)

**Models:**

- `PlatformAdmin` - Super admin (platform level)
- `AdminUser` - Tenant admin (no role differentiation)
- ❌ No `User` model - Customers can't have accounts
- ❌ No RBAC - Can't differentiate owner/staff/cashier

### Recommended: Add User Model with RBAC

```prisma
enum UserRole {
  OWNER       // Full access
  MANAGER     // Manage operations
  CASHIER     // POS only
  WAITER      // Orders only
  KITCHEN     // Kitchen display
  CUSTOMER    // Public user (optional)
}

model User {
  id           String   @id @default(cuid())
  tenantId     String?  // null for platform customers
  email        String
  passwordHash String?  // null for guest orders
  name         String
  phoneNumber  String?
  role         UserRole @default(CUSTOMER)
  isActive     Boolean  @default(true)
  metadata     Json?    // Role-specific settings
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  tenant       Tenant?       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  orders       Order[]       // Orders placed by this user
  reservations Reservation[] // Reservations made
  reviews      Review[]      // Reviews written

  @@unique([tenantId, email])
  @@index([email])
  @@index([role])
  @@map("user")
}
```

### Migration Strategy

**Option A: Keep Both (Recommended)**

- Keep `AdminUser` for backward compatibility
- Add `User` with roles for new features
- Gradually migrate to unified User model

**Option B: Merge Now**

- Drop `AdminUser`
- Migrate to `User` with OWNER/MANAGER roles
- Add customer support later

### RBAC Implementation Checklist

- [ ] Add `User` model with `UserRole` enum
- [ ] Create auth middleware with role check
- [ ] Add permission helpers (`hasPermission()`, `canAccess()`)
- [ ] Update admin pages with role guards
- [ ] Add user management UI in admin panel
- [ ] Implement invite system for staff
- [ ] Add customer registration flow (optional)

## Next Steps

1. **Decide**: User model strategy (keep AdminUser or migrate to User)
2. **Implement**: RBAC system if needed
3. **Phase 3**: Onboarding flow for new tenants
4. **Phase 4-5**: Theme & Dashboard polish
5. **Future**: Add retail module, payment integration, subscription billing
