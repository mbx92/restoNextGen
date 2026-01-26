# Multi-Tenant Access Guide

## Akses Landing Page Per Tenant

Setelah seeding database, Anda memiliki 2 tenant aktif:

### 1. Demo Restaurant (demo-restaurant)

- **URL**: http://localhost:3000/t/demo-restaurant
- **Business Type**: Restaurant
- **Admin Panel**: Login dengan `admin@wrpadi.com` / `admin123`

### 2. Demo Retail (demo-retail)

- **URL**: http://localhost:3000/t/demo-retail
- **Business Type**: Retail
- **Admin Panel**: Login dengan `admin@tokosejahtera.com` / `admin123`

### Daftar Semua Tenant

- **URL**: http://localhost:3000/tenants
- Menampilkan semua tenant aktif dengan preview theme mereka

## Manajemen Theme

Setiap tenant dapat mengatur theme mereka sendiri melalui admin panel:

### Akses Theme Settings

1. Login ke admin panel tenant (http://localhost:3000/login)
2. Navigasi ke **Settings > Theme** atau http://localhost:3000/admin/theme
3. Edit warna primary dan secondary color
4. Pilih font family dan layout variant
5. Klik **Save Changes**

### Theme yang Tersedia

- **Primary Color**: Warna utama untuk button, link, dan aksen
- **Secondary Color**: Warna sekunder untuk highlight dan dekorasi
- **Font Family**: Inter, Poppins, Lora, Playfair Display, Montserrat
- **Layout Variant**: default, minimal, bold

### Isolasi Theme

- Setiap tenant memiliki theme config sendiri di database (tabel `theme_config`)
- Theme hanya dapat diubah oleh admin tenant yang bersangkutan
- Perubahan theme langsung terlihat di landing page tenant

## Cara Kerja Multi-Tenant

### Routing

```
/t/[slug]           -> Landing page tenant (public)
/admin/*            -> Admin panel (memerlukan login)
/tenants            -> Daftar semua tenant (public)
```

### API Endpoints

```
GET /api/public/tenant/[slug]     -> Info tenant by slug
GET /api/public/tenants           -> Daftar semua tenant
GET /api/public/landing?tenant=   -> Landing data per tenant
GET /api/admin/theme              -> Get theme (tenant dari session)
POST /api/admin/theme             -> Update theme (tenant dari session)
```

### Isolasi Data

- Admin hanya bisa mengakses data tenant mereka sendiri
- `getTenantId()` di server utils memastikan isolasi data
- Setiap request admin menggunakan `tenantId` dari session

## Testing

### Test Tenant Restaurant

```bash
# 1. Akses landing page
curl http://localhost:3000/t/demo-restaurant

# 2. Login as admin
# Email: admin@wrpadi.com
# Password: admin123

# 3. Edit theme di /admin/theme
# 4. Lihat perubahan di /t/demo-restaurant
```

### Test Tenant Retail

```bash
# 1. Akses landing page
curl http://localhost:3000/t/demo-retail

# 2. Login as admin
# Email: admin@tokosejahtera.com
# Password: admin123

# 3. Edit theme di /admin/theme
# 4. Lihat perubahan di /t/demo-retail
```

## Production Setup

Untuk production, ada beberapa opsi routing multi-tenant:

### Option 1: Subdomain (Recommended)

```
demo-restaurant.yourapp.com
demo-retail.yourapp.com
```

Implementasi: Update `nuxt.config.ts` untuk detect subdomain

### Option 2: Path-based (Current)

```
yourapp.com/t/demo-restaurant
yourapp.com/t/demo-retail
```

Sudah terimplementasi

### Option 3: Custom Domain

```
wrpadi.com -> tenant: demo-restaurant
tokosejahtera.com -> tenant: demo-retail
```

Implementasi: DNS mapping + middleware untuk detect domain
