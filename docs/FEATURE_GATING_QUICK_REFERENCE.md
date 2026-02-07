# Feature Gating - Quick Reference

## 🎯 Quick Start

### Adding Limit Check to New Endpoint

```typescript
// server/api/admin/your-resource.post.ts
import { checkResourceLimit } from "~/server/utils/feature-gating";

export default defineEventHandler(async (event) => {
  // 1. Add this line before creating resource
  await checkResourceLimit(event, "menuItems"); // or "tables", "users", etc.

  // 2. Proceed with create logic
  const resource = await prisma.yourModel.create({ ... });
  return resource;
});
```

### Adding Preventive Check in Frontend

```vue
<script setup>
const { canCreate } = usePlanLimits();
const { handleError } = useApiErrorHandler();

async function createResource() {
  // Preventive check
  if (!canCreate('menuItems')) return;

  try {
    await $fetch('/api/admin/resource', { method: 'POST', ... });
  } catch (error) {
    handleError(error); // Auto-handles limit errors
  }
}
</script>
```

---

## 📋 Common Tasks

### Show Usage Card on Page

```vue
<template>
  <AdminPlanUsageCard />
</template>
```

### Disable Button When Limit Reached

```vue
<template>
  <UButton :disabled="!canCreate('menuItems', false)" @click="createItem">
    Create Item
  </UButton>
</template>

<script setup>
const { canCreate } = usePlanLimits();
</script>
```

### Check Feature Availability (Backend)

```typescript
import { hasFeature } from "~/server/utils/feature-gating";

export default defineEventHandler(async (event) => {
  const hasAdvancedAnalytics = await hasFeature(event, "Advanced Analytics");

  if (!hasAdvancedAnalytics) {
    throw createError({
      statusCode: 403,
      statusMessage: "Upgrade to Pro for Advanced Analytics",
    });
  }

  // ... analytics logic
});
```

### Get Usage Stats

```vue
<script setup>
const { usage } = usePlanLimits();

// usage.value = {
//   menuItems: { current: 45, limit: 100 },
//   tables: { current: 12, limit: 20 },
//   ...
// }
</script>
```

---

## 🔑 Key Functions

### Backend

| Function                          | Purpose                          | Returns                             |
| --------------------------------- | -------------------------------- | ----------------------------------- |
| `checkResourceLimit(event, type)` | Enforce limit, throw if exceeded | `Promise<boolean>`                  |
| `getTenantPlan(event)`            | Get tenant's active plan         | `Promise<{ plan, limits, status }>` |
| `hasFeature(event, name)`         | Check if plan has feature        | `Promise<boolean>`                  |
| `getTenantUsage(event)`           | Get current usage stats          | `Promise<TenantUsage>`              |

### Frontend

| Function                       | Purpose                         | Returns             |
| ------------------------------ | ------------------------------- | ------------------- |
| `canCreate(type, showToast?)`  | Check if can create, show toast | `boolean`           |
| `isNearLimit(resource)`        | Check if near limit (≥80%)      | `boolean`           |
| `hasReachedLimit(resource)`    | Check if at limit               | `boolean`           |
| `getUsagePercentage(resource)` | Get usage % (0-100)             | `number`            |
| `handleError(error)`           | Handle API error with routing   | `{ type, message }` |

---

## 🎨 Resource Types

```typescript
type ResourceType =
  | "menuItems" // Menu items/products
  | "tables" // Restaurant tables
  | "orders" // Orders per month
  | "users" // Staff/users
  | "storage" // File storage (MB)
  | "locations"; // Branches
```

---

## 🚨 Error Codes

| Code          | Meaning           | Action                  |
| ------------- | ----------------- | ----------------------- |
| 403 + "limit" | Limit exceeded    | Show upgrade prompt     |
| 403 (other)   | Permission denied | Show error              |
| 401           | Not authenticated | Redirect to login       |
| 400           | Validation error  | Show validation message |

---

## 📦 Imports Cheat Sheet

```typescript
// Backend
import { checkResourceLimit } from "~/server/utils/feature-gating";
import { getTenantPlan } from "~/server/utils/feature-gating";
import { hasFeature } from "~/server/utils/feature-gating";
import { getTenantUsage } from "~/server/utils/feature-gating";

// Frontend
const { canCreate, usage, isNearLimit } = usePlanLimits();
const { handleError, safeFetch } = useApiErrorHandler();
```

---

## 🔧 Plan Configuration

Edit plan limits at: `/platform/plans`

```json
{
  "limits": {
    "menuItems": 100,
    "tables": 20,
    "orders": 1000,
    "users": 5,
    "storage": 1000,
    "locations": 1
  },
  "features": ["Advanced Analytics", "Priority Support"]
}
```

**Special value:** `-1` = unlimited

---

## ✨ Best Practices

1. ✅ **Always** check limits on backend (security)
2. ✅ **Also** check on frontend (better UX)
3. ✅ Use `handleError()` for consistent error handling
4. ✅ Show usage stats proactively (don't wait for error)
5. ✅ Provide easy upgrade path (one-click buttons)
6. ❌ Don't block editing existing resources
7. ❌ Don't block deletion (let users free up space)

---

## 🧪 Quick Test

```bash
# 1. Login as tenant user
# 2. Go to /admin
# 3. See PlanUsageCard on dashboard
# 4. Try to create menu item when at limit
# 5. Should see error toast with upgrade button
# 6. Click upgrade → navigates to settings
```

---

## 🐛 Troubleshooting

### Limit not enforced?

Check:

1. Is `checkResourceLimit()` in endpoint?
2. Is limit value correct in database? (not -1)
3. Is subscription active?
4. Is planRelation connected?

### Usage stats not showing?

Check:

1. Is `/api/admin/usage` endpoint working?
2. Are there errors in console?
3. Is tenant subscription valid?
4. Try refresh with `refreshUsage()`

### Error toast not showing?

Check:

1. Is `handleError()` called in catch block?
2. Is error format correct from backend?
3. Check browser console for errors

---

## 📞 Need Help?

- 📖 Full guide: [FEATURE_GATING_EXAMPLE.md](./FEATURE_GATING_EXAMPLE.md)
- 📋 Implementation status: [FEATURE_GATING_IMPLEMENTATION.md](./FEATURE_GATING_IMPLEMENTATION.md)
- 🔍 Code reference: `server/utils/feature-gating.ts`
