# Theme System

## 5 Theme Presets

Sistem menyediakan 5 tema siap pakai yang disesuaikan dengan tipe bisnis:

### 1. Restaurant Warm 🍽️

- **Cocok untuk**: Restaurant, Cafe
- **Warna**: Amber/Brown (hangat dan mengundang selera)
- **Primary**: `#d97706` (amber-600)
- **Secondary**: `#92400e` (amber-900)
- **Font**: Lora (elegant serif)
- **Layout**: Default

### 2. Cafe Modern ☕

- **Cocok untuk**: Cafe, Bakery
- **Warna**: Cyan (modern dan fresh)
- **Primary**: `#0891b2` (cyan-600)
- **Secondary**: `#155e75` (cyan-900)
- **Font**: Inter (clean sans-serif)
- **Layout**: Minimal

### 3. Bakery Sweet 🧁

- **Cocok untuk**: Bakery
- **Warna**: Pink/Pastel (manis dan playful)
- **Primary**: `#ec4899` (pink-500)
- **Secondary**: `#be185d` (pink-700)
- **Font**: Poppins (friendly dan rounded)
- **Layout**: Default

### 4. Retail Professional 🏪

- **Cocok untuk**: Retail/Toko
- **Warna**: Blue (profesional dan trustworthy)
- **Primary**: `#2563eb` (blue-600)
- **Secondary**: `#1e40af` (blue-800)
- **Font**: Inter (clean dan readable)
- **Layout**: Minimal

### 5. Classic Green 🌿

- **Cocok untuk**: Semua tipe bisnis
- **Warna**: Green (klasik dan netral)
- **Primary**: `#16a34a` (green-600)
- **Secondary**: `#15803d` (green-700)
- **Font**: Inter
- **Layout**: Default

## Cara Menggunakan

### Di Admin Panel

1. Login ke `/admin/theme`
2. Lihat section **Theme Presets** di bagian atas
3. **Pilih preset** yang sesuai dengan bisnis Anda (akan muncul checkmark jika aktif)
4. Atau edit manual di section **Custom Theme Settings**
5. Klik **Save Changes**
6. Page akan auto-reload dengan tema baru

### Preset yang Muncul

Sistem akan **otomatis memfilter** preset berdasarkan business type tenant:

- Tenant Restaurant → melihat: Restaurant Warm, Classic Green
- Tenant Cafe → melihat: Restaurant Warm, Cafe Modern, Classic Green
- Tenant Bakery → melihat: Cafe Modern, Bakery Sweet, Classic Green
- Tenant Retail → melihat: Retail Professional, Classic Green

### Custom Theme

Selain preset, admin bisa customize:

- **Primary Color**: Warna utama (button, link, accent)
- **Secondary Color**: Warna sekunder (highlight, decoration)
- **Font Family**: Inter, Poppins, Lora, Playfair Display, Montserrat
- **Layout Variant**: default, minimal, bold
- **Custom CSS**: Advanced customization

## Technical Details

### Files Structure

```
server/config/theme-presets.ts     → Theme preset definitions
server/api/admin/theme/presets.get.ts → API untuk get presets
pages/admin/theme.vue              → Admin theme management UI
```

### API Endpoints

```
GET  /api/admin/theme/presets   → Get theme presets filtered by business type
GET  /api/admin/theme           → Get current tenant theme
POST /api/admin/theme           → Update tenant theme
```

### Database

Setiap tenant memiliki 1 record di tabel `theme_config`:

```prisma
model ThemeConfig {
  id             String   @id
  tenantId       String   @unique
  primaryColor   String
  secondaryColor String
  fontFamily     String
  layoutVariant  String
  customCss      String?
}
```

## Default Themes on Seeding

Saat seeding, theme otomatis diset sesuai business type:

- **demo-restaurant**: Restaurant Warm theme
- **demo-retail**: Retail Professional theme
