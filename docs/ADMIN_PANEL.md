# Admin Panel - wrPadi Restaurant

## Overview

Admin panel dengan sistem authentication untuk mengelola konten landing page, booking table, dan menu restaurant.

## Features Implemented

### 1. Authentication System

- **Login Page**: `/admin/login`
- **Credentials Default**:
  - Email: `admin@wrpadi.com`
  - Password: `admin123`
- **Session Management**: Menggunakan `nuxt-auth-utils` dengan secure session
- **Middleware Protection**: Semua route `/admin/*` (kecuali `/admin/login`) dilindungi dengan middleware

### 2. Admin Layout

- **Desktop Sidebar**: Fixed sidebar dengan navigasi lengkap
- **Mobile Responsive**: Hamburger menu dengan slide-over sidebar
- **User Info**: Menampilkan nama dan email admin yang login
- **Logout Button**: Tombol logout yang aman
- **Navigation Items**:
  - Dashboard
  - Orders Queue
  - Reservations
  - Tables
  - Menu
  - Landing Page (CMS)

### 3. Content Management System (CMS)

Located at: `/admin/landing`

#### Hero Section Management

- Edit hero title, subtitle, description
- Customize CTA (Call-to-Action) text and link
- Add promotional text
- Set hero image URL
- Single hero per site (automatically created or updated)

#### Featured Menu Items Management

- **Create** new featured menu items
- **Edit** existing items
- **Delete** items
- **Toggle** active/inactive status
- Fields:
  - Name
  - Description
  - Price (in Rupiah)
  - Image URL
  - Sort Order (untuk mengatur urutan tampil)
  - Active Status

### 4. API Endpoints

#### Authentication

- `POST /api/admin/auth/login` - Login admin
- `POST /api/admin/auth/logout` - Logout admin
- `GET /api/admin/auth/session` - Get current session

#### Landing Page CMS

- `GET /api/admin/landing/hero` - Get hero data
- `PATCH /api/admin/landing/hero` - Update hero (create if not exists)

#### Featured Menu

- `GET /api/admin/featured-menu` - Get all featured items
- `POST /api/admin/featured-menu` - Create new item
- `PATCH /api/admin/featured-menu/:id` - Update item
- `DELETE /api/admin/featured-menu/:id` - Delete item

## Security Features

### Middleware Protection

File: `middleware/admin-auth.ts`

- Checks authentication before accessing admin routes
- Redirects unauthenticated users to login page
- Prevents logged-in users from accessing login page

### Server Middleware

File: `server/middleware/auth.ts`

- Protects all `/api/admin/*` endpoints
- Allows public access to login endpoint
- Returns 401 for unauthorized requests

### Password Security

- Passwords hashed using `hashPassword` from nuxt-auth-utils
- Uses scrypt algorithm with salt
- Verification via `verifyPassword` function

### Input Validation

- All POST/PATCH requests validated using Zod schemas
- Type-safe inputs
- Prevents invalid data from reaching database

## Database Schema

### AdminUser Model

```prisma
model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  name         String
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([email])
}
```

### LandingHero Model

```prisma
model LandingHero {
  id          String   @id @default(cuid())
  title       String
  subtitle    String
  description String
  ctaText     String
  ctaLink     String
  promoText   String?
  imageUrl    String
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### FeaturedMenuItem Model

```prisma
model FeaturedMenuItem {
  id          String   @id @default(cuid())
  menuItemId  String?
  name        String
  description String
  price       Int
  imageUrl    String
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Database Migrations

```bash
npm run db:migrate
```

### 3. Seed Initial Admin User

```bash
npm run db:seed
```

This creates default admin:

- Email: admin@wrpadi.com
- Password: admin123

### 4. Start Development Server

```bash
npm run dev
```

### 5. Access Admin Panel

1. Navigate to: `http://localhost:3000/admin`
2. You'll be redirected to login page
3. Use default credentials
4. After login, you'll be redirected to dashboard

## Usage Guide

### Changing Admin Password

To change the password, you need to:

1. Open Prisma Studio: `npm run db:studio`
2. Navigate to AdminUser table
3. Generate new password hash using the seed script pattern
4. Update the passwordHash field

Or create a new admin user in seed.ts and run:

```bash
npm run db:seed
```

### Managing Landing Page Content

#### Edit Hero Section

1. Go to `/admin/landing`
2. Click "Edit" button in Hero Section card
3. Update fields as needed
4. Click "Save Changes"

#### Add Featured Menu Item

1. Go to `/admin/landing`
2. Scroll to "Featured Menu Items" section
3. Click "Add Item" button
4. Fill in the form
5. Click "Save"

#### Edit/Delete Featured Item

- Click pencil icon to edit
- Click trash icon to delete (with confirmation)
- Click eye icon to toggle active/inactive status

### Mobile Usage

- Admin panel is fully responsive
- On mobile, tap hamburger menu (☰) to open sidebar
- Tap items to navigate
- Sidebar auto-closes after navigation

## Next Steps (Future Features)

1. **Reservations Management**
   - View pending reservations
   - Confirm/reject reservations
   - Send WhatsApp confirmations

2. **Orders Management**
   - Real-time order queue
   - Update order status
   - Kitchen display

3. **Tables Management**
   - Add/edit/delete tables
   - Generate QR codes
   - Table availability status

4. **Menu Management**
   - Full menu CRUD
   - Categories management
   - Menu item availability toggle

5. **Dashboard Analytics**
   - Today's stats
   - Revenue charts
   - Popular items

## Troubleshooting

### Can't login

- Verify database is running and migrated
- Check `.env` DATABASE_URL is correct
- Run `npm run db:seed` to recreate admin user

### Session expires immediately

- Check that nuxt-auth-utils is properly configured
- Verify no cookie conflicts
- Clear browser cookies for localhost

### EPERM Errors

- Use `npm run dev:clean` to clear cache
- Or manually delete `.nuxt` and `.output` folders

## Technologies Used

- **Nuxt 4**: Framework
- **Nuxt UI v4**: Component library
- **Nuxt Auth Utils**: Session management & password hashing
- **Prisma**: ORM and database migrations
- **PostgreSQL**: Database
- **Zod**: Runtime validation
- **TypeScript**: Type safety
