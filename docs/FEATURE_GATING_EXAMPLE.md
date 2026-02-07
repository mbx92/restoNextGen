# Feature Gating System - Panduan Implementasi

## Arsitektur

```
Tenant → Subscription → Plan → Limits (JSON)
```

## Plan Limits Structure

```json
{
  "menuItems": 100, // Max menu items tenant bisa buat
  "tables": 20, // Max tables
  "orders": 1000, // Max orders per month
  "users": 5, // Max users/staff
  "storage": 1000, // Storage dalam MB
  "locations": 1 // Jumlah lokasi/cabang
}
```

**Note:** Nilai `-1` = unlimited

---

## Cara Menggunakan

### 1. Check Limit Sebelum Create Resource

**Contoh: Di endpoint `server/api/admin/menu/items.post.ts`**

```typescript
import { checkResourceLimit } from "~/server/utils/feature-gating";

export default defineEventHandler(async (event) => {
  // 1. Autentikasi
  const { tenantId } = await getTenantContext(event);

  // 2. CHECK LIMIT DULU sebelum create
  await checkResourceLimit(event, "menuItems");
  // ^ Akan throw 403 error jika limit tercapai

  // 3. Validasi input
  const body = await readBody(event);
  const data = menuItemSchema.parse(body);

  // 4. Baru create
  const menuItem = await prisma.menuItem.create({
    data: {
      ...data,
      tenantId,
    },
  });

  return menuItem;
});
```

### 2. Check Feature Availability

**Contoh: Cek apakah plan punya fitur "Advanced Analytics"**

```typescript
import { hasFeature } from "~/server/utils/feature-gating";

export default defineEventHandler(async (event) => {
  // Cek apakah tenant punya fitur analytics
  const canAccessAnalytics = await hasFeature(event, "Advanced Analytics");

  if (!canAccessAnalytics) {
    throw createError({
      statusCode: 403,
      statusMessage: "Upgrade to Pro plan to access Advanced Analytics",
    });
  }

  // Lanjutkan dengan analytics logic
  // ...
});
```

### 3. Get Current Usage Stats

**Contoh: Di dashboard untuk tampilkan usage**

```typescript
import { getTenantUsage } from "~/server/utils/feature-gating";

export default defineEventHandler(async (event) => {
  const usage = await getTenantUsage(event);

  return usage;
  // Returns:
  // {
  //   menuItems: { current: 45, limit: 100 },
  //   tables: { current: 12, limit: 20 },
  //   orders: { current: 234, limit: 1000 },
  //   users: { current: 3, limit: 5 },
  //   storage: { current: 0, limit: 1000 },
  //   locations: { current: 1, limit: 1 }
  // }
});
```

---

## Endpoints yang Perlu Di-protect

### ✅ Harus implement `checkResourceLimit`:

1. **Menu Items**
   - `POST /api/admin/menu/items`
   - Check: `checkResourceLimit(event, "menuItems")`

2. **Tables**
   - `POST /api/admin/tables`
   - Check: `checkResourceLimit(event, "tables")`

3. **Users/Staff**
   - `POST /api/admin/users`
   - Check: `checkResourceLimit(event, "users")`

4. **Orders** (opsional, biasanya per-month)
   - `POST /api/admin/orders` atau `/api/retail/orders`
   - Check: `checkResourceLimit(event, "orders")`

### ⚠️ Special Case: Orders

Orders dibatasi **per month**, bukan total. Logic di `feature-gating.ts` sudah handle ini:

```typescript
case "orders":
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  currentCount = await prisma.order.count({
    where: {
      tenantId,
      createdAt: { gte: startOfMonth },
    },
  });
```

---

## Error Handling di Frontend

**Saat user mencapai limit, API akan throw error 403:**

```json
{
  "statusCode": 403,
  "statusMessage": "Plan limit exceeded: You can only have 100 menuItems. Please upgrade your plan."
}
```

**Handle di frontend:**

```vue
<script setup>
async function createMenuItem() {
  try {
    await $fetch("/api/admin/menu/items", {
      method: "POST",
      body: formData.value,
    });

    toast.add({
      title: "Success",
      description: "Menu item created",
      color: "success",
    });
  } catch (error) {
    if (error.statusCode === 403) {
      // Limit exceeded - show upgrade prompt
      toast.add({
        title: "Plan Limit Exceeded",
        description: error.statusMessage,
        color: "error",
        actions: [
          {
            label: "Upgrade Plan",
            click: () => navigateTo("/admin/settings#subscription"),
          },
        ],
      });
    } else {
      // Other errors
      toast.add({
        title: "Error",
        description: error.message,
        color: "error",
      });
    }
  }
}
</script>
```

---

## Tampilkan Usage di Dashboard

**Buat endpoint untuk get usage:**

`server/api/admin/usage.get.ts`:

```typescript
import { getTenantUsage } from "~/server/utils/feature-gating";

export default defineEventHandler(async (event) => {
  await requireAdminAuth(event);
  return await getTenantUsage(event);
});
```

**Di frontend dashboard:**

```vue
<template>
  <UCard>
    <template #header>
      <h3>Plan Usage</h3>
    </template>

    <div class="space-y-4">
      <!-- Menu Items -->
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>Menu Items</span>
          <span
            >{{ usage.menuItems.current }} / {{ usage.menuItems.limit }}</span
          >
        </div>
        <UProgress
          :value="(usage.menuItems.current / usage.menuItems.limit) * 100"
          :color="getProgressColor(usage.menuItems)"
        />
      </div>

      <!-- Tables -->
      <div>
        <div class="flex justify-between text-sm mb-1">
          <span>Tables</span>
          <span>{{ usage.tables.current }} / {{ usage.tables.limit }}</span>
        </div>
        <UProgress
          :value="(usage.tables.current / usage.tables.limit) * 100"
          :color="getProgressColor(usage.tables)"
        />
      </div>

      <!-- ... other resources ... -->
    </div>

    <template #footer>
      <UButton
        v-if="isNearLimit"
        color="primary"
        @click="navigateTo('/admin/settings#subscription')"
      >
        Upgrade Plan
      </UButton>
    </template>
  </UCard>
</template>

<script setup>
const { data: usage } = await useFetch("/api/admin/usage");

function getProgressColor(resource) {
  const percentage = (resource.current / resource.limit) * 100;
  if (percentage >= 90) return "error";
  if (percentage >= 70) return "warning";
  return "success";
}

const isNearLimit = computed(() => {
  return Object.values(usage.value).some(
    (resource) => resource.current / resource.limit >= 0.8,
  );
});
</script>
```

---

## Migration Plan

Karena feature gating belum aktif, implementasinya bisa bertahap:

### Phase 1: Soft Limits (Warning Only)

- Tampilkan usage stats di dashboard
- Beri warning saat mendekati limit (80%-90%)
- Belum block create

### Phase 2: Hard Limits (Enforcement)

- Aktifkan `checkResourceLimit` di semua endpoints
- Block create saat limit tercapai
- Show upgrade prompts

### Phase 3: Enhanced Features

- Email notification saat mendekati limit
- Auto-upgrade suggestions
- Usage analytics & trends

---

## FAQ

**Q: Bagaimana jika tenant sudah exceed limit sebelum feature gating aktif?**

A: Mereka bisa tetap gunakan existing resources, tapi tidak bisa create baru sampai upgrade atau hapus beberapa resources.

**Q: Bagaimana handle unlimited (-1)?**

A: Di `checkResourceLimit`, ada check:

```typescript
if (limit === -1) return true;
```

**Q: Orders per month, bagaimana reset counter?**

A: Counter otomatis "reset" karena kita hanya count orders yang `createdAt >= startOfMonth`. Tidak perlu manual reset.

**Q: Storage limit bagaimana implementasinya?**

A: Perlu tambahan logic untuk track uploaded file sizes. Saat ini masih TODO di `feature-gating.ts`.
