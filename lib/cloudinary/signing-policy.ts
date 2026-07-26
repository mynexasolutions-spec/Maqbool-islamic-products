import {
  CLOUDINARY_ALLOWED_FORMATS,
  CLOUDINARY_MAX_IMAGE_BYTES,
  CLOUDINARY_SCOPES,
  type CloudinaryScope,
} from "./scopes";

export function normalizeSigningParams(value: unknown): Record<string, string | number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value);
  if (!entries.length || entries.length > 30) return null;
  const normalized: Record<string, string | number> = {};
  for (const [key, raw] of entries) {
    if (!/^[a-z_]+$/.test(key) || (typeof raw !== "string" && typeof raw !== "number")) return null;
    if (String(raw).length > 2_000) return null;
    normalized[key] = raw;
  }
  return normalized;
}

export function validateSigningParams(
  scope: CloudinaryScope,
  params: Record<string, string | number>,
  nowSeconds = Math.floor(Date.now() / 1_000),
) {
  if (
    params.folder !== CLOUDINARY_SCOPES[scope] ||
    (params.resource_type !== undefined && params.resource_type !== "image") ||
    (params.type !== undefined && params.type !== "upload")
  ) return "Media destination is not allowed.";

  const formats = params.allowed_formats === undefined
    ? []
    : String(params.allowed_formats).split(",").map((item) => item.trim().toLowerCase()).filter(Boolean);
  if (formats.some((format) => !CLOUDINARY_ALLOWED_FORMATS.includes(format as never))) {
    return "One or more image formats are not allowed.";
  }

  const maxFileSize = Number(params.max_file_size ?? CLOUDINARY_MAX_IMAGE_BYTES);
  if (!Number.isFinite(maxFileSize) || maxFileSize <= 0 || maxFileSize > CLOUDINARY_MAX_IMAGE_BYTES) {
    return "Image size limit is not allowed.";
  }
  const timestamp = Number(params.timestamp);
  if (!Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > 15 * 60) {
    return "Upload request has expired.";
  }
  return null;
}
