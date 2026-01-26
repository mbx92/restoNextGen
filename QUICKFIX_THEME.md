# Quick Fix Summary - Theme System

## Yang Sudah Diperbaiki

### 1. Theme Presets Tidak Muncul ✅

**Masalah**: Preset tidak render di halaman admin
**Solusi**:

- Fixed TypeScript type errors (`any` → `ThemePreset`)
- Fixed self-closing HTML void elements (`<input/>` → `<input>`)
- Import type definition dari `~/server/config/theme-presets`

### 2. Landing Page Tidak Berubah Warna ✅

**Masalah**: Hardcoded colors tidak mengikuti theme config
**Solusi**:

- Buat CSS utility classes: `.bg-theme-primary`, `.text-theme-primary`, dll
- Update semua komponen landing menggunakan theme-aware classes
- Inject CSS variables via `useHead()` di `/t/[slug]` page
- CSS variables di-set dari theme config database

## Cara Menggunakan

### Test Restaurant Theme

```bash
1. Buka: http://localhost:3000/t/demo-restaurant
   → Seharusnya warna AMBER (Restaurant Warm theme)

2. Login: admin@wrpadi.com / admin123
3. Ke: /admin/theme
4. Lihat section "Theme Presets" - seharang ada 2 preset:
   - Restaurant Warm (checkmark, aktif)
   - Classic Green
5. Klik "Classic Green" → warna berubah di form
6. Klik "Save Changes"
7. Refresh landing page → warna berubah GREEN
```

### Test Retail Theme

```bash
1. Buka: http://localhost:3000/t/demo-retail
   → Seharusnya warna BLUE (Retail Professional theme)

2. Login: admin@tokosejahtera.com / admin123
3. Ke: /admin/theme
4. Lihat section "Theme Presets" - seharang ada 2 preset:
   - Retail Professional (checkmark, aktif)
   - Classic Green
5. Test switch preset atau custom colors
```

## Files yang Diubah

### Core Files

- `pages/admin/theme.vue` - Fixed types, render presets
- `pages/t/[slug].vue` - Inject CSS variables via useHead
- `assets/css/main.css` - Added theme-aware utility classes

### Landing Components

- `components/landing/HeroSection.vue` - Use theme classes
- `components/landing/FeaturedSection.vue` - Use theme classes
- `components/landing/LocationSection.vue` - Use theme classes

## CSS Variables System

Setiap halaman `/t/[slug]` akan inject:

```css
:root {
  --primary-color: #d97706; /* dari DB theme_config */
  --secondary-color: #92400e;
}
```

Utility classes:

```css
.bg-theme-primary {
  background-color: var(--primary-color);
}
.text-theme-primary {
  color: var(--primary-color);
}
.border-theme-primary {
  border-color: var(--primary-color);
}
```

## Troubleshooting

### Preset tidak muncul?

- Pastikan sudah login
- Check console browser untuk error API
- Verify `/api/admin/theme/presets` return data

### Warna tidak berubah?

- Hard refresh browser (Ctrl+Shift+R)
- Check CSS variables di DevTools → Elements → :root
- Pastikan theme sudah di-save di database

### Theme tidak persist setelah save?

- Check database: `SELECT * FROM theme_config;`
- Verify tenantId match dengan session user
