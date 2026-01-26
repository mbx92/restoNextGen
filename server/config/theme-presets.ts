export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  businessTypes: string[];
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  layoutVariant: string;
  preview?: string;
}

export const themePresets: ThemePreset[] = [
  {
    id: "restaurant-warm",
    name: "Restaurant Warm",
    description: "Tema hangat untuk restoran dengan aksen amber dan brown",
    businessTypes: ["restaurant", "cafe"],
    primaryColor: "#d97706", // amber-600
    secondaryColor: "#92400e", // amber-900
    fontFamily: "Lora",
    layoutVariant: "default",
  },
  {
    id: "cafe-modern",
    name: "Cafe Modern",
    description: "Tema modern untuk cafe dengan warna neutral dan clean",
    businessTypes: ["cafe", "bakery"],
    primaryColor: "#0891b2", // cyan-600
    secondaryColor: "#155e75", // cyan-900
    fontFamily: "Inter",
    layoutVariant: "minimal",
  },
  {
    id: "bakery-sweet",
    name: "Bakery Sweet",
    description: "Tema manis untuk bakery dengan warna pink dan pastel",
    businessTypes: ["bakery"],
    primaryColor: "#ec4899", // pink-500
    secondaryColor: "#be185d", // pink-700
    fontFamily: "Poppins",
    layoutVariant: "default",
  },
  {
    id: "retail-professional",
    name: "Retail Professional",
    description: "Tema profesional untuk toko retail dengan warna blue",
    businessTypes: ["retail"],
    primaryColor: "#2563eb", // blue-600
    secondaryColor: "#1e40af", // blue-800
    fontFamily: "Inter",
    layoutVariant: "minimal",
  },
  {
    id: "classic-green",
    name: "Classic Green",
    description: "Tema klasik hijau untuk semua jenis bisnis",
    businessTypes: ["restaurant", "cafe", "bakery", "retail"],
    primaryColor: "#16a34a", // green-600
    secondaryColor: "#15803d", // green-700
    fontFamily: "Inter",
    layoutVariant: "default",
  },
];

/**
 * Get theme presets filtered by business type
 */
export function getThemePresetsByBusinessType(
  businessType: string
): ThemePreset[] {
  return themePresets.filter((preset) =>
    preset.businessTypes.includes(businessType)
  );
}

/**
 * Get a specific theme preset by ID
 */
export function getThemePresetById(id: string): ThemePreset | undefined {
  return themePresets.find((preset) => preset.id === id);
}
