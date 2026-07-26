export const CLOUDINARY_SCOPES = {
  product: "maqbool/products",
  category: "maqbool/categories",
  hero: "maqbool/hero",
  "home-banner": "maqbool/home-banner",
} as const;

export type CloudinaryScope = keyof typeof CLOUDINARY_SCOPES;

export const CLOUDINARY_MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const CLOUDINARY_ALLOWED_FORMATS = [
  "avif",
  "gif",
  "jpeg",
  "jpg",
  "png",
  "webp",
] as const;

export function isCloudinaryScope(value: string): value is CloudinaryScope {
  return Object.prototype.hasOwnProperty.call(CLOUDINARY_SCOPES, value);
}
