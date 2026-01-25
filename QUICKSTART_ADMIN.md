# Quick Start - Admin Panel

## 1️⃣ Setup Database

```bash
# Run migrations
npm run db:migrate

# Seed admin user
npm run db:seed
```

## 2️⃣ Start Server

```bash
npm run dev
```

## 3️⃣ Login ke Admin

- URL: http://localhost:3000/admin
- Email: `admin@wrpadi.com`
- Password: `admin123`

## 📱 Fitur yang Sudah Jalan

### ✅ Authentication & Authorization

- [x] Login page dengan validasi
- [x] Session management (secure cookies)
- [x] Middleware protection untuk admin routes
- [x] Auto-redirect jika belum login
- [x] Logout functionality

### ✅ Admin Layout

- [x] Sidebar navigation (desktop)
- [x] Mobile hamburger menu + slideover
- [x] User info display
- [x] Responsive design

### ✅ CMS Landing Page

- [x] Edit Hero Section (title, subtitle, description, CTA, image)
- [x] Manage Featured Menu Items (CRUD)
- [x] Toggle item active/inactive
- [x] Sort order management

## 🚀 Next: Implementasi Halaman Lain

Halaman admin yang perlu diimplementasikan:

1. **Dashboard** (`/admin/index.vue`) - Stats & overview
2. **Reservations** (`/admin/reservations.vue`) - Booking management
3. **Orders** (`/admin/orders.vue`) - Order queue & status
4. **Tables** (`/admin/tables.vue`) - Table management + QR codes
5. **Menu** (`/admin/menu.vue`) - Full menu CRUD

## 🔐 Security Notes

- Password di-hash dengan scrypt (via nuxt-auth-utils)
- Session-based authentication
- CSRF protection via nuxt-auth-utils
- Input validation dengan Zod
- SQL injection protection via Prisma

## 📝 API Endpoints Tersedia

### Auth

- `POST /api/admin/auth/login`
- `POST /api/admin/auth/logout`
- `GET /api/admin/auth/session`

### Landing CMS

- `GET /api/admin/landing/hero`
- `PATCH /api/admin/landing/hero`
- `GET /api/admin/featured-menu`
- `POST /api/admin/featured-menu`
- `PATCH /api/admin/featured-menu/:id`
- `DELETE /api/admin/featured-menu/:id`

## 💡 Tips

- Gunakan `npm run dev:clean` jika ada masalah cache
- Check `docs/ADMIN_PANEL.md` untuk dokumentasi lengkap
- Default admin credentials ada di seed file
