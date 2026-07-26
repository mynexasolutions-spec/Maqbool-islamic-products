export type CloudinaryUploadAsset = {
  secureUrl: string;
  publicId: string;
  resourceType: "image";
  format: string;
  width: number;
  height: number;
  bytes: number;
};

export type MediaActionResult =
  | { ok: true; message: string; id?: string }
  | { ok: false; message: string; retryable?: boolean };

export type ProductImageRecord = {
  id: string;
  product_id: string;
  secure_url: string;
  public_id: string | null;
  resource_type: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  alt_text: string;
  color_variant_id: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
};

export type HeroSlideRecord = {
  id: string;
  placement: "left" | "right";
  title: string;
  subtitle: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  alt_text: string;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
};

export type HomeBannerRecord = {
  id: string;
  title: string;
  alt_text: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  link_url: string | null;
  is_active: boolean;
  display_order: number;
};

export type GlobalFaqRecord = {
  id: string;
  question: string;
  answer: string;
  is_active: boolean;
  display_order: number;
};
