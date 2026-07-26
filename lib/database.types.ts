export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Timestamped = {
  created_at: string;
  updated_at: string;
};

type CategoryRow = Timestamped & {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number;
};

type ProductRow = Timestamped & {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  rating: number;
  review_count: number;
  badge: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
};

type VariantRow = Timestamped & {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  value: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  color: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
};

type ProductImageRow = Timestamped & {
  id: string;
  product_id: string;
  secure_url: string;
  public_id: string | null;
  resource_type: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  alt_text: string;
  color_variant_id: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
};

type InformationRow = Timestamped & {
  id: string;
  product_id: string;
  label: string;
  value: string;
  display_order: number;
};

type ProductFaqRow = Timestamped & {
  id: string;
  product_id: string;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
};

type HeroSlideRow = Timestamped & {
  id: string;
  placement: "left" | "right";
  title: string | null;
  subtitle: string | null;
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  alt_text: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
};

type HomeBannerRow = Timestamped & {
  id: string;
  title: string | null;
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  alt_text: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
};

type GlobalFaqRow = Timestamped & {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
};

type StorefrontSettingsRow = Timestamped & {
  id: boolean;
  home_banner_enabled: boolean;
};

type ContactMessageRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  order_id: string | null;
  subject: string;
  message: string;
  created_at: string;
};

type MarketRow = Timestamped & {
  id: string;
  code: string;
  slug: string;
  name: string;
  country_code: string;
  currency_code: string;
  locale: string;
  currency_minor_unit: number;
  is_active: boolean;
  display_order: number;
};

type MarketCheckoutSettingsRow = Timestamped & {
  market_id: string;
  tax_label: string;
  tax_rate: number;
  tax_applies_to_shipping: boolean;
  shipping_fee: number;
  free_shipping_threshold: number | null;
  cod_fee: number;
  cod_enabled: boolean;
  online_enabled: boolean;
  delivery_estimate: string;
  configuration_complete: boolean;
};

type VariantMarketPriceRow = Timestamped & {
  id: string;
  variant_id: string;
  market_id: string;
  price: number;
  compare_at_price: number | null;
  is_active: boolean;
};

type OrderRow = Timestamped & {
  id: string;
  order_number: string;
  market_id: string;
  market_code: string;
  currency_code: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: Json;
  subtotal: number;
  discount: number;
  shipping: number;
  tax_label: string;
  tax_rate: number;
  tax: number;
  cod_fee: number;
  total: number;
  coupon_code: string | null;
  payment_method: "cod" | "online";
  payment_status: "pending" | "simulated" | "paid" | "failed" | "refunded";
  status: "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  stock_restored_at: string | null;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  product_name: string;
  product_slug: string;
  variant_name: string;
  sku: string;
  image_url: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
};

type TableDef<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown> = Partial<Row>,
  Update extends Record<string, unknown> = Partial<Insert>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export type Database = {
  public: {
    Tables: {
      categories: TableDef<CategoryRow>;
      products: TableDef<ProductRow>;
      product_variants: TableDef<VariantRow>;
      product_images: TableDef<ProductImageRow>;
      product_information: TableDef<InformationRow>;
      product_faqs: TableDef<ProductFaqRow>;
      hero_slides: TableDef<HeroSlideRow>;
      home_banner_images: TableDef<HomeBannerRow>;
      global_faqs: TableDef<GlobalFaqRow>;
      storefront_settings: TableDef<StorefrontSettingsRow>;
      contact_messages: TableDef<ContactMessageRow>;
      markets: TableDef<MarketRow>;
      market_checkout_settings: TableDef<MarketCheckoutSettingsRow>;
      variant_market_prices: TableDef<VariantMarketPriceRow>;
      orders: TableDef<OrderRow>;
      order_items: TableDef<OrderItemRow>;
    };
    Views: Record<string, never>;
    Functions: {
      place_market_order: {
        Args: {
          market_slug_input: string;
          items_input: Json;
          customer_input: Json;
          address_input: Json;
          payment_method_input: string;
          coupon_input?: string | null;
        };
        Returns: Json;
      };
      set_market_order_status: {
        Args: { order_id_input: string; status_input: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
