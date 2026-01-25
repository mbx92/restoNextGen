export interface BusinessTypeModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export interface BusinessType {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  features: string[];
  modules: BusinessTypeModule[];
}

export const businessTypes: Record<string, BusinessType> = {
  restaurant: {
    id: "restaurant",
    name: "Restaurant / Warung Makan",
    description: "Untuk bisnis F&B dengan dine-in, takeaway, dan reservasi meja",
    icon: "i-heroicons-building-storefront",
    color: "primary",
    features: [
      "Menu Management",
      "Table Reservations",
      "Dine-in Orders via QR",
      "Takeaway Orders",
      "Payment Integration",
      "Customer Reviews",
    ],
    modules: [
      {
        id: "menu",
        name: "Menu & Categories",
        description: "Kelola menu makanan dan kategori",
        icon: "i-heroicons-document-text",
        color: "success",
      },
      {
        id: "tables",
        name: "Table Management",
        description: "Kelola meja dan reservasi",
        icon: "i-heroicons-table-cells",
        color: "info",
      },
      {
        id: "orders",
        name: "Order Management",
        description: "Kelola pesanan dine-in dan takeaway",
        icon: "i-heroicons-shopping-cart",
        color: "warning",
      },
      {
        id: "reviews",
        name: "Reviews & Ratings",
        description: "Kelola ulasan pelanggan",
        icon: "i-heroicons-star",
        color: "warning",
      },
    ],
  },
  retail: {
    id: "retail",
    name: "Toko Retail",
    description: "Untuk toko dengan inventory, POS, dan manajemen produk",
    icon: "i-heroicons-shopping-bag",
    color: "secondary",
    features: [
      "Product Management",
      "Inventory Tracking",
      "POS System",
      "Stock Alerts",
      "Sales Reports",
      "Supplier Management",
    ],
    modules: [
      {
        id: "products",
        name: "Product Management",
        description: "Kelola produk dan variasi",
        icon: "i-heroicons-cube",
        color: "primary",
      },
      {
        id: "inventory",
        name: "Inventory",
        description: "Kelola stok dan supplier",
        icon: "i-heroicons-archive-box",
        color: "info",
      },
      {
        id: "pos",
        name: "Point of Sale",
        description: "Sistem kasir dan pembayaran",
        icon: "i-heroicons-calculator",
        color: "success",
      },
    ],
  },
  salon: {
    id: "salon",
    name: "Salon & Spa",
    description: "Untuk salon kecantikan dengan booking dan manajemen layanan",
    icon: "i-heroicons-scissors",
    color: "info",
    features: [
      "Service Management",
      "Staff Scheduling",
      "Appointment Booking",
      "Customer Records",
      "Payment Processing",
      "Loyalty Program",
    ],
    modules: [
      {
        id: "services",
        name: "Services",
        description: "Kelola layanan dan harga",
        icon: "i-heroicons-sparkles",
        color: "primary",
      },
      {
        id: "appointments",
        name: "Appointments",
        description: "Kelola booking dan jadwal",
        icon: "i-heroicons-calendar",
        color: "info",
      },
      {
        id: "staff",
        name: "Staff Management",
        description: "Kelola staff dan shift",
        icon: "i-heroicons-user-group",
        color: "success",
      },
    ],
  },
};

export const getBusinessType = (id: string): BusinessType | undefined => {
  return businessTypes[id];
};

export const getBusinessTypesList = (): BusinessType[] => {
  return Object.values(businessTypes);
};

export const getModulesForBusinessType = (
  businessTypeId: string,
): BusinessTypeModule[] => {
  const businessType = getBusinessType(businessTypeId);
  return businessType?.modules || [];
};
