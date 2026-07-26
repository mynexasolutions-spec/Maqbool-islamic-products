import "server-only";

import { v2 as cloudinary } from "cloudinary";

function configureCloudinary() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL;
  if (cloudinaryUrl) {
    let credentials: URL;
    try {
      credentials = new URL(cloudinaryUrl);
    } catch {
      throw new Error("CLOUDINARY_URL is invalid.");
    }
    if (
      credentials.protocol !== "cloudinary:" ||
      !credentials.hostname ||
      !credentials.username ||
      !credentials.password
    ) {
      throw new Error("CLOUDINARY_URL is incomplete.");
    }
    cloudinary.config({
      cloud_name: credentials.hostname,
      api_key: decodeURIComponent(credentials.username),
      api_secret: decodeURIComponent(credentials.password),
      secure: true,
    });
    return;
  }

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary server credentials are not configured.");
  }
  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
}

export function signCloudinaryParameters(params: Record<string, string | number>) {
  configureCloudinary();
  const apiSecret = cloudinary.config().api_secret;
  if (!apiSecret) throw new Error("Cloudinary API secret is not configured.");
  return cloudinary.utils.api_sign_request(params, apiSecret);
}

export async function destroyCloudinaryImage(publicId: string) {
  configureCloudinary();
  const result = await cloudinary.uploader.destroy(publicId, {
    invalidate: true,
    resource_type: "image",
  });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary returned ${result.result || "an unknown error"}.`);
  }
}
