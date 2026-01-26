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

### 1.5 Rename Restaurant Tables dengan Generic Names

Gunakan `@@map()` untuk nama generic tanpa prefix (untuk semua business types):

| Model       | Database Table   | Purpose (All Types)          |
| ----------- | ---------------- | ---------------------------- |
| Category    | `category`       | Categories/Departments       |
| MenuItem    | `item`           | Products/Menu Items/Services |
| Table       | `resource_table` | Tables/Rooms/Stations        |
| Order       | `order`          | Orders/Transactions          |
| OrderItem   | `order_item`     | Line Items                   |
| Reservation | `reservation`    | Reservations/Appointments    |
| Payment     | `payment`        | Payments                     |

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
  - [x] Fix Nuxt UI v4 UTable patterns (`:data`, `#xxx-cell` slots)
  - [x] Fix USelectMenu role object handling
  - [x] Implement global ConfirmDialog component
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

- [x] Create theme API endpoint (`/api/public/theme`)
- [x] Load theme in app.vue
- [x] Create theme editor in admin (`/admin/theme`)
- [x] Fix theme endpoint to handle missing session gracefully

### Phase 5: Admin Dashboard ✅ COMPLETED

- [x] Update navigation to be dynamic based on businessType
- [x] Add business type indicator in sidebar
- [x] Create module-specific routes (restaurant/retail/salon)
- [x] Implement permission-based menu filtering
- [x] User management page with RBAC:
  - [x] Create/edit user modals
  - [x] Role dropdown with descriptions and icons
  - [x] USelectMenu object handling (role as object in form, extract value on submit)
  - [x] Fix tenantId validation in create endpoint
  - [x] Active/inactive status toggle

### Phase 6: RBAC System ✅ COMPLETED

**Database Schema:**

- [x] 6 RBAC models (Permission, Role, RolePermission, BusinessTypeRole, BusinessTypePermission, TenantPermissionOverride)
- [x] Add `role` field to AdminUser (OWNER, MANAGER, CASHIER, WAITER, KITCHEN)
- [x] Migrations: `20260126013821_add_rbac_models`, `20260126021720_add_role_to_admin_user`

**Data Seeding:**

- [x] 25 permissions across 10 categories
- [x] 6 roles with hierarchy levels (OWNER=5, MANAGER=4, staff=3, CUSTOMER=1)
- [x] 3 business type templates (RESTAURANT all enabled, CAFE no kitchen/reservations, BAKERY takeaway only)

**Server-Side:**

- [x] Dual-mode permission system (static PERMISSIONS + async hasPermission())
- [x] Auth middleware with role verification
- [x] Platform RBAC API endpoints (4 routes)

**Client-Side:**

- [x] User model references - Fixed in admin/users endpoints (added prisma import, tenantId validation)
- [ ] Add platform admin authentication to RBAC API endpoints
- [ ] Implement tenant RBAC view modal (read-only permissions display)
- [ ] Add invite system for staff members (email invitations)

- [ ] TypeScript errors in server/utils/auth-helpers.ts (hasPermission signature)
- [ ] User model references (prisma not imported in some admin/users endpoints)
- [ ] Add platform admin authentication to RBAC API endpoints
- [ ] Implement tenant RBAC view modal (read-only permissions display)
- [ ] Add user management UI for inviting staff members

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

## User Management & RBAC Strategy ✅ COMPLETED

### Implementation Summary

**Current State:**

- ✅ `PlatformAdmin` - Super admin (platform level)
- ✅ `AdminUser` - Tenant admin with role field (OWNER, MANAGER, CASHIER, WAITER, KITCHEN)
- ✅ Full RBAC system with 6 models: Permission, Role, RolePermission, BusinessTypeRole, BusinessTypePermission, TenantPermissionOverride
- ✅ 25 permissions across 10 categories
- ✅ 6 roles with hierarchy (OWNER=5, MANAGER=4, CASHIER/WAITER/KITCHEN=3, CUSTOMER=1)
- ✅ 3 business type templates (RESTAURANT, CAFE, BAKERY)

### RBAC Architecture

**Platform-Managed Dynamic RBAC:**

- Platform admin controls all permissions and roles via `/platform/rbac`
- Business type templates define default permissions per business vertical
- Tenants can view their assigned permissions (read-only)
- Permission checks use dual-mode: static client-side + async server-side

**Permission Models:**

```prisma
model Permission {
  id          String  @id @default(cuid())
  code        String  @unique  // e.g., "MANAGE_MENU"
  name        String  // Display name
  category    String  // Group permissions
  description String?
  isSystem    Boolean @default(true)
  // Relations: rolePermissions, businessTypePermissions, tenantOverrides
}

model Role {
  id          String  @id @default(cuid())
  code        String  @unique  // OWNER, MANAGER, etc.
  name        String
  description String?
  hierarchy   Int     // Higher = more permissions
  isSystem    Boolean @default(true)
  // Relations: rolePermissions, businessTypeRoles
}

model BusinessTypeRole {
  businessType String  // RESTAURANT, CAFE, BAKERY
  roleId       String
  isEnabled    Boolean @default(true)
}

model BusinessTypePermission {
  businessType   String
  permissionId   String
  isEnabled      Boolean @default(true)
}

model TenantPermissionOverride {
  tenantId       String
  permissionId   String
  isEnabled      Boolean
  // Override permission for specific tenant
}
```

### RBAC Implementation Checklist ✅

- [x] Add RBAC Prisma models (Permission, Role, RolePermission, BusinessTypeRole, BusinessTypePermission, TenantPermissionOverride)
- [x] Add `role` field to `AdminUser` model (default: "OWNER")
- [x] Create migration `20260126013821_add_rbac_models` and `20260126021720_add_role_to_admin_user`
- [x] Create seed script with default RBAC data (25 permissions, 6 roles, business type templates)
- [x] Create permission helpers (`hasPermission()` async, static `PERMISSIONS` matrix)
- [x] Create `usePermissions()` composable for client-side checks
- [x] Add OWNER role bypass in RBAC (always returns true for full access)
- [x] Create `usePermissions()` composable for client-side checks
- [x] Update admin layout with permission-based navigation
- [x] Create Platform RBAC admin UI (`/platform/rbac`):
  - [x] Permissions tab (grouped by category)
  - [x] Roles tab (with hierarchy and permission counts)
  - [x] Permission Matrix tab (role-permission grid)
  - [x] Business Types tab (RESTAURANT/CAFE/BAKERY configs)
- [x] Create Platform RBAC API endpoints:
  - [x] `/api/platform/rbac/permissions` - List all permissions
  - [x] `/api/platform/rbac/roles` - List all roles with permissions
  - [x] `/api/platform/rbac/matrix` - Get role-permission matrix
  - [x] `/api/platform/rbac/business-types/[type]` - Get business type config
- [x] Update auth middleware to check staff roles
- [x] Fix logout endpoint (skip role check)
- [x] Fix UFormGroup compatibility (Nuxt UI v4)
- [x] Create global ConfirmDialog component:
  - [x] `composables/useConfirmDialog.ts` - State management
  - [x] `components/ConfirmDialog.vue` - Modal component
  - [x] Replace all `confirm()` calls across admin pages
- [x] Add user management UI in admin panel:
  - [x] Create user modal with role selection
  - [x] Edit user modal with role dropdown
  - [x] Fix USelectMenu object handling pattern
  - [x] Tenant-scoped user creation/editing
- [ ] Add tenant RBAC view modal (read-only permissions display)
- [ ] Implement invite system for staff members (email invitations)

### Permission Categories

1. **Menu Management** - MANAGE_CATEGORIES, MANAGE_MENU
2. **Orders** - VIEW_ALL_ORDERS, MANAGE_ORDERS, PROCESS_PAYMENTS
3. **Tables & Reservations** - MANAGE_TABLES, MANAGE_RESERVATIONS
4. **Reviews** - VIEW_REVIEWS, MODERATE_REVIEWS
5. **Content** - MANAGE_LANDING, MANAGE_FEATURED
6. **Settings** - MANAGE_SETTINGS, MANAGE_THEME, VIEW_ANALYTICS
7. **Users** - VIEW_USERS, MANAGE_USERS
8. **Kitchen** - VIEW_KITCHEN_ORDERS, UPDATE_ORDER_STATUS
9. **Reporting** - VIEW_REPORTS, EXPORT_DATA
10. **System** - MANAGE_INTEGRATIONS

### Business Type Templates

**RESTAURANT** (Full Features):

- All roles enabled: OWNER, MANAGER, CASHIER, WAITER, KITCHEN
- All permissions enabled (25/25)

**CAFE** (No Kitchen Management):

- Roles: OWNER, MANAGER, CASHIER, WAITER (4/6)
- Disabled: MANAGE_RESERVATIONS, MANAGE_TABLES, kitchen-related permissions
- Peuxt UI v4 Migration Notes

### Key Pattern Changes

**UTable:**

- Use `:data` prop (not `:rows`)
- Column format: `{ accessorKey: 'field', header: 'Label' }` (not `key/label`)
- Slot naming: `#columnName-cell` (not `#columnName-data`)
- Access row: `row.original.fieldName` (not `row.fieldName`)

**USelectMenu:**

- Stores full object: `{value, label, description, icon}`
- Form initialization must use object, not string value
- Extract value on submit: `typeof role === 'object' ? role?.value : role`

**UModal:**

- Use `v-model:open` (not `v-model`)
- Slots: `#body`, `#footer="{ close }"`

**Other Components:**

- `USwitch` (not `UToggle`)
- `UDropdownMenu` (not `UDropdown`)
- No `UDivider` (use `<hr>`)

**SSR & Hydration:**

- Wrap `UTable` with date columns in `<ClientOnly>`
- Wrap components using browser APIs in `<ClientOnly>`
- Always provide `#fallback` slot with loading state

### Global Confirm Dialog Pattern

Replace browser `confirm()` with:

```typescript
const { confirm } = useConfirmDialog();

const result = await confirm({
  title: "Delete Item?",
  message: "This action cannot be undone",
  confirmColor: "error", // 'primary' | 'error' | 'warning'
  confirmText: "Delete",
  cancelText: "Cancel",
});

if (result) {
  // User confirmed
}
```

## Phase 6: POS Module (Planned)

### Overview

POS (Point of Sale) system untuk semua business types dengan fitur berbeda:

- **Restaurant**: Table management, dine-in/takeaway, kitchen integration, split bill
- **Retail**: Product scanning, inventory check, quick checkout
- **Cafe**: Quick service, takeaway focused, no table management

### 6.1 Restaurant POS Features

**Core Features:**

- ✅ Order model supports `DINE_IN` and `TAKEAWAY`
- ✅ Payment integration ready (Midtrans)
- ✅ RBAC permissions: `PROCESS_PAYMENT`, `VIEW_PAYMENTS`, `CREATE_ORDER`

**To Implement:**

1. **POS Dashboard** (`/admin/pos`)
   - Quick order entry screen
   - Table selection dropdown
   - Menu item grid with search
   - Cart with item modification
   - Order type toggle (Dine-in/Takeaway)

2. **Table Management Integration**
   - Link order to table
   - Show table occupancy status
   - Support multiple orders per table

3. **Kitchen Display System** (`/admin/kitchen`)
   - Real-time order display
   - Order status updates (NEW → PREPARING → READY → SERVED)
   - Timer for each order
   - Filter by order type

4. **Payment Processing**
   - Cash payment
   - Card payment (Midtrans)
   - Split bill by item
   - Split bill by person
   - Print receipt

5. **Order Modifiers**
   - Add notes per item (e.g., "Extra spicy", "No ice")
   - Quantity adjustment
   - Custom price override (manager only)

### 6.2 Retail POS Features

**Simpler than Restaurant:**

- Product barcode scanning
- Quick search by name/SKU
- Cart management
- Direct payment (no kitchen/table)
- Receipt printing

**To Implement:**

1. **Retail POS** (`/admin/pos`)
   - Barcode scanner input
   - Product search grid
   - Cart with quantity update
   - Total calculation with tax
   - Payment methods (cash/card)

2. **Inventory Check**
   - Stock availability indicator
   - Low stock warning
   - Out of stock prevention

### 6.3 Database Schema Updates

**Current Schema (Already Supports POS):**

```prisma
model Order {
  type OrderType // DINE_IN, TAKEAWAY
  tableId String? // For dine-in
  customerName String?
  subtotal Int
  total Int
  items OrderItem[]
  payments Payment[]
}

model OrderItem {
  nameSnapshot String
  priceSnapshot Int
  qty Int
  notes String? // For modifiers
  lineTotal Int
}
```

**Additional Fields Needed:**

```prisma
model OrderItem {
  // Add modifiers support
  modifiers Json? // [{type: "extra", name: "Extra Spicy", price: 0}]
}

model Order {
  // Add split bill support
  splitInfo Json? // {type: "item"|"person", splits: [...]}

  // Add order source
  source String? // "POS", "QR", "ONLINE"
}
```

### 6.4 Permission Matrix for POS

| Role    | Create Order | Process Payment | View Kitchen | Modify Price |
| ------- | ------------ | --------------- | ------------ | ------------ |
| OWNER   | ✅           | ✅              | ✅           | ✅           |
| MANAGER | ✅           | ✅              | ✅           | ✅           |
| CASHIER | ✅           | ✅              | ❌           | ❌           |
| WAITER  | ✅           | ❌              | ❌           | ❌           |
| KITCHEN | ❌           | ❌              | ✅           | ❌           |

### 6.5 Implementation Checklist

**Phase 6.1: Basic POS UI**

- [ ] Create `/admin/pos` page with layout
- [ ] Menu item selection grid
- [ ] Cart component with add/remove
- [ ] Order type selector (Dine-in/Takeaway)
- [ ] Table selection (restaurant only)
- [ ] Submit order API integration

**Phase 6.2: Payment Integration**

- [ ] Cash payment flow
- [ ] Midtrans card payment
- [ ] Payment confirmation modal
- [ ] Receipt generation (PDF/print)
- [ ] Payment history view

**Phase 6.3: Kitchen Display**

- [ ] Create `/admin/kitchen` page
- [ ] Real-time order updates (polling/websocket)
- [ ] Order status buttons
- [ ] Timer display
- [ ] Print to kitchen printer

**Phase 6.4: Split Bill**

- [ ] Split by item selection
- [ ] Split by person count
- [ ] Multiple payment methods per order
- [ ] Partial payment tracking

**Phase 6.5: Retail POS Variant**

- [ ] Barcode scanner integration
- [ ] Inventory lookup
- [ ] Quick checkout flow
- [ ] Stock update after sale

### 6.6 Business Type Variants

**Restaurant POS Flow:**

```
Select Table → Browse Menu → Add Items with Modifiers
→ Send to Kitchen → Customer Pays → Close Order
```

**Retail POS Flow:**

```
Scan/Search Products → Add to Cart → Calculate Total
→ Process Payment → Update Stock → Print Receipt
```

**Cafe POS Flow:**

```
Quick Menu Select → Add to Cart → Customer Pays
→ Send to Barista → Prepare → Serve
```

### 6.7 Technical Stack

**Frontend:**

- Nuxt UI v4 components (UCard, UButton, UInput)
- Real-time updates: Nuxt WebSocket or polling
- Print: Browser Print API or library like `vue-print`

**Backend:**

- API routes: `/api/admin/pos/orders`, `/api/admin/pos/payment`
- RBAC checks on all endpoints
- Transaction support for payment

**Future Enhancements:**

- Offline mode (PWA with local storage)
- Receipt printer integration (ESC/POS protocol)
- Customer display (second screen)
- Multi-currency support

## Next Steps

1. ✅ **RBAC system** - Completed with full implementation
2. ✅ **User management** - Admin panel with role-based access
3. ✅ **Global UI patterns** - ConfirmDialog, Nuxt UI v4 migrations
4. ✅ **Multi-tenant ready** - 2 demo tenants (restaurant + retail)
5. ✅ **Generic table names** - Renamed resto\_\* to generic names
6. **Phase 6: POS Module** (Next Priority):
   - [ ] Restaurant POS with table management
   - [ ] Kitchen Display System
   - [ ] Payment processing with split bill
   - [ ] Retail POS variant with barcode scanner
7. **Polish & Testing**:
   - [ ] Test all RBAC permission flows
   - [ ] Add loading states to all modals
   - [ ] Add error handling to all API calls
   - [ ] E2E testing for critical flows
8. **Future**: Subscription billing, webhooks, analytics dashboardBLES, kitchen operations

- Permissions: 18/25

## Next Steps

1. **Decide**: User model strategy (keep AdminUser or migrate to User)
2. **Implement**: RBAC system if needed
3. **Phase 3**: Onboarding flow for new tenants
4. **Phase 4-5**: Theme & Dashboard polish
5. **Future**: Add retail module, payment integration, subscription billing
