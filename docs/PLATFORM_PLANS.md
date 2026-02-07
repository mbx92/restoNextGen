# Platform Admin - Plan Management

## Overview

Sistem Plan Management memungkinkan Platform Admin untuk mengelola subscription plans yang tersedia untuk tenants.

## Database Schema

### Model Plan

```prisma
model Plan {
  id              String   @id @default(cuid())
  name            String   @unique
  slug            String   @unique
  description     String?
  price           Int      @default(0) // in cents
  billingInterval String   @default("month") // "month", "year"
  features        Json     // Array of features
  limits          Json     // Resource limits
  isActive        Boolean  @default(true)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  subscriptions Subscription[]
}
```

### Subscription Update

- Subscription sekarang memiliki `planId` (FK ke Plan)
- Field `plan` (string) masih ada untuk backward compatibility
- Relation: `planRelation` untuk access Plan data

## Default Plans

Sistem menyediakan 4 default plans:

### 1. Free Plan

- **Price:** $0/month
- **Limits:** 20 menu items, 5 tables, 100 orders, 2 users
- **Features:** Basic reporting, email support

### 2. Starter Plan

- **Price:** $299/month
- **Limits:** 100 menu items, 20 tables, 1000 orders, 5 users
- **Features:** Advanced reporting, QR ordering, custom branding

### 3. Professional Plan

- **Price:** $799/month
- **Limits:** Unlimited menu/tables/orders, 20 users, 3 locations
- **Features:** Analytics, inventory, custom domain, API access

### 4. Enterprise Plan

- **Price:** Custom
- **Limits:** Unlimited everything
- **Features:** White-label, SLA, custom integrations

## API Endpoints

### Platform Admin Endpoints

```
GET    /api/platform/plans              # List all plans
POST   /api/platform/plans              # Create new plan
GET    /api/platform/plans/:id          # Get single plan
PATCH  /api/platform/plans/:id          # Update plan
DELETE /api/platform/plans/:id          # Delete plan
```

### Create Plan Request

```json
{
  "name": "Premium",
  "slug": "premium",
  "description": "For premium customers",
  "price": 49900,
  "billingInterval": "month",
  "features": ["Feature 1", "Feature 2"],
  "limits": {
    "menuItems": 200,
    "tables": 50,
    "orders": 5000,
    "users": 10,
    "storage": 5000,
    "locations": 2
  },
  "isActive": true,
  "sortOrder": 3
}
```

## UI Access

**URL:** `/platform/plans`

**Features:**

- View all plans in card grid layout
- Create new plan
- Edit existing plan
- Delete plan (only if no active subscriptions)
- See subscription count per plan
- Toggle plan active status

## Resource Limits

Limits menggunakan integer dengan konvensi:

- `-1` = Unlimited
- `0` = Not allowed
- `>0` = Specific limit

**Limit Fields:**

- `menuItems`: Number of menu items
- `tables`: Number of tables/stations
- `orders`: Number of orders per period
- `users`: Number of users/staff
- `storage`: Storage in MB
- `locations`: Number of locations (optional)

## Seeding Plans

```bash
# Seed default plans
npx tsx prisma/seed-plans.ts

# This will:
# 1. Create/update 4 default plans
# 2. Migrate existing subscriptions to use planId
```

## Tenant Provisioning

When creating a new tenant, specify plan slug:

```typescript
await provisionTenant({
  slug: "my-restaurant",
  name: "My Restaurant",
  businessType: "restaurant",
  ownerEmail: "owner@example.com",
  ownerName: "Owner Name",
  ownerPassword: "password123",
  plan: "starter", // Plan slug
});
```

System will:

1. Find the plan by slug
2. Create subscription with `planId`
3. Set trial period (14 days)

## Subscription Management

Subscriptions now include plan info:

```typescript
// Get subscription with plan details
const subscription = await prisma.subscription.findUnique({
  where: { tenantId },
  include: {
    planRelation: true, // Full plan data
  },
});

console.log(subscription.planRelation.name); // "Professional"
console.log(subscription.planRelation.price); // 79900
console.log(subscription.planRelation.limits); // { menuItems: -1, ... }
```

## Upgrading/Downgrading Plans

To change a tenant's plan:

```typescript
await prisma.subscription.update({
  where: { tenantId },
  data: {
    planId: newPlan.id,
    plan: newPlan.slug, // Keep legacy field updated
    currentPeriodStart: new Date(),
    currentPeriodEnd: addMonths(new Date(), 1),
  },
});
```

## Best Practices

### 1. Plan Deletion

- Only delete plans with zero active subscriptions
- For legacy plans, deactivate instead of deleting
- UI prevents deletion if subscriptions exist

### 2. Pricing

- Store price in cents (e.g., 29900 = $299.00)
- Avoid floating point for money calculations

### 3. Features Array

- Keep features user-friendly and concise
- Order by importance (most important first)
- Use consistent language across plans

### 4. Limits

- Use -1 for unlimited features
- Be generous with limits for higher tiers
- Consider usage patterns when setting limits

### 5. Migration

- Keep legacy `plan` field during transition
- Update both `plan` and `planId` when changing
- Monitor for any code still using string plan field

## Future Enhancements

- [ ] Plan comparison view for tenants
- [ ] Automated plan upgrade flow
- [ ] Usage-based billing support
- [ ] Plan add-ons/extensions
- [ ] Promo codes and discounts
- [ ] Plan analytics (popular plans, MRR, etc.)
- [ ] Tenant self-service plan change
- [ ] Payment gateway integration

## Notes

- Platform admin tidak memerlukan authentication saat ini (TODO)
- Semua plan endpoint belum di-protect dengan auth middleware
- Revenue tracking masih hardcoded $0 di dashboard
