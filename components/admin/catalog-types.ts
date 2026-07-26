export type AdminCatalogCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
  imageUrl: string;
  imagePublicId: string;
  imageAltText: string;
};

export type AdminCatalogVariant = {
  id?: string;
  sku: string;
  name: string;
  value: string;
  price: number;
  compareAtPrice: number | null;
  stock: number;
  color: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
};

export type AdminCatalogInformation = {
  id?: string;
  label: string;
  value: string;
  displayOrder: number;
};

export type AdminCatalogFaq = {
  id?: string;
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
};

export type AdminCatalogImage = {
  id: string;
  secureUrl: string;
  altText: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  colorVariantId?: string | null;
};

export type AdminCatalogProduct = {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  rating: number;
  reviewCount: number;
  badge: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  seoTitle: string;
  seoDescription: string;
  variants: AdminCatalogVariant[];
  information: AdminCatalogInformation[];
  faqs: AdminCatalogFaq[];
  images: AdminCatalogImage[];
};

export type CatalogActionResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export type ProductSaveResult =
  | { ok: true; message: string; id: string }
  | { ok: false; error: string };

export type CategoryInput = Omit<AdminCatalogCategory, "productCount">;
export type ProductInput = Omit<AdminCatalogProduct, "categoryName" | "images">;

export function createEmptyAdminProduct(): AdminCatalogProduct {
  return {
    id: "new",
    categoryId: "",
    categoryName: "",
    name: "",
    slug: "",
    description: "",
    price: 0,
    compareAtPrice: null,
    rating: 0,
    reviewCount: 0,
    badge: "",
    isFeatured: false,
    isActive: true,
    displayOrder: 0,
    seoTitle: "",
    seoDescription: "",
    variants: [],
    information: [],
    faqs: [],
    images: [],
  };
}
