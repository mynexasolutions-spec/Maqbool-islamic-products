export type ProductImage = {
  id: string;
  src: string;
  alt: string;
};

export type ProductVariant = {
  id: string;
  name: string;
  value: string;
  price: number;
  originalPrice?: number;
  stock: number;
  color?: string;
  image?: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  featured: boolean;
  createdAt: string;
  active: boolean;
  badge?: string;
  images: ProductImage[];
  variants: ProductVariant[];
  specifications: Record<string, string>;
  faqs: Array<{ question: string; answer: string }>;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  active: boolean;
};

export type CartItem = {
  id: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  variantId: string;
  variantName: string;
  price: number;
  quantity: number;
  stock: number;
};

export type CustomerSession = {
  name: string;
  phone: string;
  verifiedAt: string;
};

export type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type OrderStatus = "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "online";

export type MockOrder = {
  id: string;
  createdAt: string;
  customer: CustomerSession;
  address: Address;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  codCharge: number;
  total: number;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
};

export type AdminProductRecord = Product;
export type AdminCategoryRecord = Category;
export type AdminOrderRecord = MockOrder;

