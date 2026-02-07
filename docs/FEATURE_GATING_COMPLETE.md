# Feature Gating - Complete Implementation

## ✅ What Was Implemented

Complete boolean feature gating system dengan tenant-level overrides untuk SaaS platform.

---

## 📦 Changes Made

### 1. **Database Schema** ([prisma/schema.prisma](prisma/schema.prisma))

Added 3 new models:

#### `Feature`

```prisma
- id, code (unique), name, description
- category: "branding", "analytics", "integrations", "support", "advanced"
- isActive, sortOrder
```

#### `PlanFeature`

```prisma
- planId + featureId (composite key)
- enabled: boolean
- Maps which features are available in each plan
```

#### `TenantFeatureOverride`

```prisma
- tenantId + featureId (composite key)
- enabled: boolean
- reason: optional explanation
- Allows per-tenant feature grants/denials
```

### 2. **Server Utils** ([server/utils/feature-gating.ts](server/utils/feature-gating.ts))

Enhanced feature gating functions:

- **`hasFeature(event, featureCode)`** - Check if tenant has access to a feature
  - Priority: Tenant override → Plan feature → Legacy JSON fallback
- **`getTenantFeatures(event)`** - Get all enabled features for tenant
  - Returns `{ "FEATURE_CODE": true/false }` object
  - Combines plan features + tenant overrides

### 3. **API Endpoints**

#### Tenant Admin API

- `GET /api/admin/features` - Get enabled features for current tenant

#### Platform Admin API

- `GET /api/platform/features` - List all features
- `POST /api/platform/features` - Create new feature
- `PATCH /api/platform/features/:id` - Update feature
- `DELETE /api/platform/features/:id` - Delete feature
- `POST /api/platform/plans/:planId/features` - Assign features to plan
- `POST /api/platform/tenants/:tenantId/features` - Set tenant override

### 4. **Frontend Composable** ([composables/useFeatures.ts](composables/useFeatures.ts))

```typescript
const { hasFeature, requireFeature, features } = useFeatures();

// Check in code
if (hasFeature("CUSTOM_DOMAIN")) {
  // Show feature
}

// Check with prompt
if (!requireFeature("API_ACCESS", "API Access")) {
  return; // Shows upgrade toast
}
```

### 5. **Seed Data** ([prisma/seed-plans.ts](prisma/seed-plans.ts))

Added 16 default features across 5 categories:

- **Branding**: Custom Domain, Custom Branding, White Label
- **Analytics**: Basic Reporting, Advanced Analytics, Real-time Dashboard
- **Integrations**: API Access, Webhooks, Third-party Integrations
- **Support**: Email Support, Priority Support, Dedicated Account Manager
- **Advanced**: Multi-location, Inventory Management, Staff Management, Custom Workflows

Feature-Plan mappings:

- **Free**: 2 features (Basic Reporting, Email Support)
- **Starter**: 5 features (+ Advanced Analytics, Custom Branding, Priority Support)
- **Pro**: 10 features (+ Real-time Dashboard, Custom Domain, Multi-location, Inventory, API Access)
- **Enterprise**: All 16 features

---

## 🎯 How to Use

### Backend (API Enforcement)

```typescript
// In any API route
export default defineEventHandler(async (event) => {
  // Check feature before allowing access
  if (!(await hasFeature(event, "CUSTOM_DOMAIN"))) {
    throw createError({
      statusCode: 403,
      statusMessage: "Custom Domain feature not available in your plan",
    });
  }

  // Proceed with logic...
});
```

### Frontend (UI Conditional Rendering)

```vue
<script setup>
const { hasFeature } = useFeatures();
</script>

<template>
  <!-- Show button only if feature enabled -->
  <UButton v-if="hasFeature('ADVANCED_ANALYTICS')" @click="openAnalytics">
    Advanced Analytics
  </UButton>

  <!-- Lock icon if feature disabled -->
  <UButton
    v-else
    :icon="
      hasFeature('API_ACCESS') ? 'i-heroicons-check' : 'i-heroicons-lock-closed'
    "
    @click="requireFeature('API_ACCESS', 'API Access')"
  >
    API Settings
  </UButton>
</template>
```

### Platform Admin (Override Feature for Specific Tenant)

```typescript
// Grant "WHITE_LABEL" to specific tenant even if not in their plan
await $fetch("/api/platform/tenants/tenant-xyz/features", {
  method: "POST",
  body: {
    featureId: "WHITE_LABEL",
    enabled: true,
    reason: "Enterprise customer special request",
  },
});
```

---

## 🚀 Migration & Deployment

### 1. Run Migration

```bash
npx prisma migrate dev --name add_feature_gating
```

### 2. Seed Features

```bash
node prisma/seed-plans.ts
```

### 3. Verify Database

```sql
SELECT * FROM feature;
SELECT * FROM plan_feature;
```

---

## 📊 Database Structure

```
Plan (existing)
  ├── features (Json) ← Legacy, kept for backward compatibility
  └── planFeatures[] → PlanFeature

Feature (new)
  ├── planFeatures[] → PlanFeature
  └── tenantOverrides[] → TenantFeatureOverride

PlanFeature (new)
  ├── plan → Plan
  └── feature → Feature

TenantFeatureOverride (new)
  ├── tenant → Tenant
  └── feature → Feature
```

---

## ✨ Benefits

1. **Granular Control**: Enable/disable features per-plan or per-tenant
2. **Override System**: Platform admin can grant special access to specific tenants
3. **Backward Compatible**: Falls back to legacy `Plan.features` JSON array
4. **Type-safe**: Feature codes are strings but can be made enum later
5. **Audit Trail**: Override includes `reason` field
6. **Category Organization**: Features grouped by category for UI display
7. **Frontend-friendly**: Simple `hasFeature()` check in components

---

## 🔜 Next Steps (Optional)

1. **TypeScript Enums**: Create feature code enum for type safety
2. **Feature Categories as Enum**: Make categories type-safe
3. **Feature Dependencies**: Some features require others (e.g., API_ACCESS requires ADVANCED_ANALYTICS)
4. **Feature Usage Analytics**: Track which features are actually used
5. **Self-service Upgrades**: UI for tenants to upgrade/add features
6. **Module Integration**: Link features to business modules (future modular system)

---

## 🐛 Known Issues

- ~~Prisma client generation EPERM error on Windows~~ (temporary, restart dev server)
- Platform admin API endpoints not yet protected by auth middleware (TODO comments added)
- Storage limit tracking not implemented yet (separate task)

---

## 📝 Notes

- Migration created: `20260207102254_add_feature_gating`
- All existing plans updated with feature mappings
- `Plan.features` JSON kept for backward compatibility
- Feature checking now prioritizes: Override → PlanFeature → Legacy JSON
