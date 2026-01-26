# Quick Start - Retail Demo

## Login Credentials

### Platform Admin (Super Admin)

- URL: http://localhost:3002/platform/login
- Email: `superadmin@wrpadi.com`
- Password: `superadmin123`

### Retail Demo Tenant

- Tenant Slug: `demo-retail`
- Business Name: **Toko Sejahtera - Demo Retail**
- Business Type: `retail`
- Plan: `pro` (30 days trial)

### Admin Panel Login

- URL: http://localhost:3002/admin/login
- Email: `admin@tokosejahtera.com`
- Password: `admin123`
- Role: `OWNER`

### User Accounts

| Email                      | Password    | Role     | Phone             |
| -------------------------- | ----------- | -------- | ----------------- |
| owner@tokosejahtera.com    | owner123    | OWNER    | +62 821 1111 1111 |
| manager@tokosejahtera.com  | manager123  | MANAGER  | +62 821 2222 2222 |
| cashier@tokosejahtera.com  | cashier123  | CASHIER  | +62 821 3333 3333 |
| customer@tokosejahtera.com | customer123 | CUSTOMER | +62 821 9999 9999 |

## Business Information

**Toko Sejahtera**

- Description: Toko retail modern dengan berbagai produk kebutuhan sehari-hari berkualitas
- Address: Jl. Merdeka Raya No. 123, Surabaya, Jawa Timur 60111
- Phone: +62 821 9876 5432
- Email: info@tokosejahtera.com
- Opening Hours:
  - Senin - Sabtu: 08:00 - 21:00
  - Minggu: 09:00 - 18:00

## Theme Configuration

- Primary Color: #2563eb (blue-600)
- Secondary Color: #7c3aed (purple-600)
- Font Family: Inter
- Layout: default

## Sample Data

### Product Categories (4)

1. **Makanan & Minuman** - Produk makanan dan minuman kemasan
2. **Kebutuhan Rumah Tangga** - Perlengkapan rumah tangga
3. **Kesehatan & Kecantikan** - Produk kesehatan dan kecantikan
4. **Elektronik** - Peralatan elektronik dan gadget

### Products (5)

1. **Indomie Goreng** (Makanan & Minuman) - Rp 3.500
2. **Aqua 600ml** (Makanan & Minuman) - Rp 4.000
3. **Sabun Cuci Piring** (Rumah Tangga) - Rp 12.000
4. **Masker Kesehatan** (Kesehatan) - Rp 15.000
5. **Kabel USB Type-C** (Elektronik) - Rp 25.000

## RBAC Permissions for Retail

### Enabled Roles (4)

- ✅ OWNER - Full access
- ✅ MANAGER - Operational management
- ✅ CASHIER - POS & payments
- ✅ CUSTOMER - Basic access

### Disabled Roles (2)

- ❌ WAITER - Not needed for retail
- ❌ KITCHEN - Not needed for retail

### Enabled Permissions (17)

- Product/Menu Management (treat products as menu items)
- Categories
- Orders & POS
- Payments
- Settings & Configuration
- Analytics & Reports
- User Management

### Disabled Permissions (8)

- ❌ Tables Management (no dine-in)
- ❌ Reservations (not applicable)
- ❌ Kitchen Display (no kitchen)
- ❌ Reviews (focus on POS)
- ❌ Landing Page Management
- ❌ Featured Menu

## Database Tables Used

Since we use **row-level tenancy**, retail tenant shares the same tables as restaurant but filtered by `tenantId`:

| Table            | Usage in Retail            |
| ---------------- | -------------------------- |
| `category`       | Product categories         |
| `item`           | Products (inventory items) |
| `order`          | Sales transactions         |
| `order_item`     | Order line items           |
| `payment`        | Payment records            |
| `resource_table` | ❌ Not used                |
| `reservation`    | ❌ Not used                |

## Next Steps

1. **Login as OWNER** to explore full features
2. **Add more products** via Menu management
3. **Create sample orders** to test POS flow
4. **Test permissions** by logging in as different roles
5. **Customize theme** in Settings > Theme

## Notes

- All tables with `resto_` prefix can be used for any business type
- Products are stored in `resto_menu_item` table (generic naming)
- Future: Can add `retail_inventory` for stock tracking
- Future: Can add `retail_supplier` for supplier management
