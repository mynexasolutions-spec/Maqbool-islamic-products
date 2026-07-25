import type {
  AdminCategoryRecord,
  AdminOrderRecord,
  AdminProductRecord,
} from "@/lib/models";

export type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  orders: number;
  spent: number;
  joinedAt: string;
};

export type AdminDemoState = {
  products: AdminProductRecord[];
  categories: AdminCategoryRecord[];
  orders: AdminOrderRecord[];
  customers: AdminCustomer[];
};

export const adminDemoSeed: AdminDemoState = {
  categories: [
    { id: "cat-quran", name: "Quran & Tafsir", slug: "quran-tafsir", active: true, description: "Qurans, translations and study editions." },
    { id: "cat-prayer", name: "Prayer Essentials", slug: "prayer-essentials", active: true, description: "Prayer mats, tasbih and everyday essentials." },
    { id: "cat-fragrance", name: "Ittars & Perfumes", slug: "ittars-perfumes", active: true, description: "Alcohol-free fragrances and oud." },
    { id: "cat-gifts", name: "Islamic Gifts", slug: "islamic-gifts", active: false, description: "Thoughtful gifts for every occasion." },
  ],
  products: [
    {
      id: "prod-quran",
      slug: "holy-quran-arabic",
      name: "The Holy Quran (Arabic Text)",
      category: "Quran & Tafsir",
      description: "A clear Arabic-script edition with an elegant hardbound cover.",
      price: 699,
      originalPrice: 899,
      rating: 4.9,
      reviewCount: 1256,
      featured: true,
      createdAt: "2026-07-01T09:00:00.000Z",
      active: true,
      badge: "Bestseller",
      images: [{ id: "img-quran", src: "/quran.webp", alt: "The Holy Quran" }],
      variants: [
        { id: "var-quran-green", name: "Cover", value: "Emerald", price: 699, stock: 18, color: "#164f3f" },
        { id: "var-quran-gold", name: "Cover", value: "Gold", price: 749, stock: 7, color: "#c69b43" },
      ],
      specifications: { Language: "Arabic", Binding: "Hardcover", Pages: "604" },
      faqs: [{ question: "Does it include translation?", answer: "This edition contains Arabic text only." }],
    },
    {
      id: "prod-mat",
      slug: "premium-velvet-prayer-mat",
      name: "Premium Velvet Prayer Mat",
      category: "Prayer Essentials",
      description: "Soft, travel-friendly velvet prayer mat with a non-slip base.",
      price: 549,
      originalPrice: 799,
      rating: 4.8,
      reviewCount: 982,
      featured: true,
      createdAt: "2026-07-08T09:00:00.000Z",
      active: true,
      images: [{ id: "img-mat", src: "/mat.webp", alt: "Green velvet prayer mat" }],
      variants: [{ id: "var-mat-green", name: "Color", value: "Forest", price: 549, stock: 24, color: "#174c3b" }],
      specifications: { Material: "Velvet", Size: "110 × 70 cm" },
      faqs: [{ question: "Is it washable?", answer: "Gentle hand washing is recommended." }],
    },
    {
      id: "prod-ittar",
      slug: "royal-trio-ittar",
      name: "Royal Trio Concentrated Perfume Oil",
      category: "Ittars & Perfumes",
      description: "A gift-ready trio of alcohol-free perfume oils.",
      price: 1199,
      originalPrice: 1599,
      rating: 4.7,
      reviewCount: 512,
      featured: false,
      createdAt: "2026-07-12T09:00:00.000Z",
      active: true,
      badge: "-25%",
      images: [{ id: "img-ittar", src: "/ittar.webp", alt: "Royal trio perfume oils" }],
      variants: [{ id: "var-ittar-12", name: "Volume", value: "3 × 12 ml", price: 1199, stock: 4 }],
      specifications: { Type: "Concentrated perfume oil", Alcohol: "Free" },
      faqs: [{ question: "How should it be applied?", answer: "Apply a small amount to pulse points." }],
    },
  ],
  orders: [
    {
      id: "MQB-24071",
      createdAt: "2026-07-22T10:30:00.000Z",
      customer: { name: "Ayaan Khan", phone: "9876543210", verifiedAt: "2026-07-20T12:00:00.000Z" },
      address: { id: "addr-1", label: "Home", name: "Ayaan Khan", phone: "9876543210", line1: "12 Noor Street", city: "Lucknow", state: "Uttar Pradesh", pincode: "226001", isDefault: true },
      items: [{ id: "line-1", productId: "prod-quran", slug: "holy-quran-arabic", name: "The Holy Quran (Arabic Text)", image: "/quran.webp", variantId: "var-quran-green", variantName: "Emerald", price: 699, quantity: 1, stock: 18 }],
      subtotal: 699,
      shipping: 60,
      discount: 0,
      codCharge: 30,
      total: 789,
      paymentMethod: "cod",
      status: "processing",
    },
    {
      id: "MQB-24070",
      createdAt: "2026-07-21T08:15:00.000Z",
      customer: { name: "Maryam Ali", phone: "9123456780", verifiedAt: "2026-07-21T08:00:00.000Z" },
      address: { id: "addr-2", label: "Home", name: "Maryam Ali", phone: "9123456780", line1: "44 Garden Enclave", city: "Hyderabad", state: "Telangana", pincode: "500001", isDefault: true },
      items: [{ id: "line-2", productId: "prod-mat", slug: "premium-velvet-prayer-mat", name: "Premium Velvet Prayer Mat", image: "/mat.webp", variantId: "var-mat-green", variantName: "Forest", price: 549, quantity: 2, stock: 24 }],
      subtotal: 1098,
      shipping: 0,
      discount: 110,
      codCharge: 0,
      total: 988,
      paymentMethod: "online",
      status: "shipped",
    },
  ],
  customers: [
    { id: "cust-1", name: "Ayaan Khan", phone: "9876543210", orders: 3, spent: 2687, joinedAt: "2026-06-04" },
    { id: "cust-2", name: "Maryam Ali", phone: "9123456780", orders: 1, spent: 988, joinedAt: "2026-07-21" },
    { id: "cust-3", name: "Zoya Siddiqui", phone: "9988776655", orders: 5, spent: 5240, joinedAt: "2026-04-18" },
  ],
};

export function freshAdminDemoState(): AdminDemoState {
  return JSON.parse(JSON.stringify(adminDemoSeed)) as AdminDemoState;
}
