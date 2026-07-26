"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import { destroyCloudinaryImage } from "@/lib/cloudinary/server";
import type { CloudinaryUploadAsset, MediaActionResult } from "@/lib/cloudinary/types";
import { CLOUDINARY_ALLOWED_FORMATS } from "@/lib/cloudinary/scopes";
import { createAdminClient } from "@/lib/supabase/admin";

function validAsset(asset: CloudinaryUploadAsset) {
  return asset.resourceType === "image" &&
    asset.publicId.startsWith("maqbool/products/") &&
    /^https:\/\/res\.cloudinary\.com\//.test(asset.secureUrl) &&
    CLOUDINARY_ALLOWED_FORMATS.includes(asset.format.toLowerCase() as typeof CLOUDINARY_ALLOWED_FORMATS[number]) &&
    Number.isInteger(asset.width) && asset.width > 0 &&
    Number.isInteger(asset.height) && asset.height > 0 &&
    Number.isInteger(asset.bytes) && asset.bytes > 0 && asset.bytes <= 10 * 1024 * 1024;
}

async function authorizedClient() {
  await requireAdmin();
  return createAdminClient();
}

function unauthorized(error: unknown): MediaActionResult | null {
  return error instanceof AdminAuthorizationError
    ? { ok: false, message: "Your admin session has expired. Please sign in again." }
    : null;
}

export async function saveProductImage(input: {
  productId: string;
  asset: CloudinaryUploadAsset;
  altText: string;
  colorVariantId?: string | null;
}): Promise<MediaActionResult> {
  try {
    const supabase = await authorizedClient();
    if (!/^[0-9a-f-]{36}$/i.test(input.productId) || !validAsset(input.asset)) {
      return { ok: false, message: "The uploaded image metadata is invalid." };
    }
    const { count, error: countError } = await supabase
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("product_id", input.productId);
    if (countError) return { ok: false, message: countError.message };

    const displayOrder = count ?? 0;
    const { data, error } = await supabase.from("product_images").insert({
      product_id: input.productId,
      secure_url: input.asset.secureUrl,
      public_id: input.asset.publicId,
      resource_type: "image",
      format: input.asset.format,
      width: input.asset.width,
      height: input.asset.height,
      bytes: input.asset.bytes,
      alt_text: input.altText.trim().slice(0, 180),
      color_variant_id: input.colorVariantId || null,
      is_featured: displayOrder === 0,
      is_active: true,
      display_order: displayOrder,
    }).select("id").single();
    if (error) return { ok: false, message: error.message };
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { ok: true, id: data.id, message: "Product image saved." };
  } catch (error) {
    return unauthorized(error) ?? { ok: false, message: "Unable to save the product image." };
  }
}

export async function updateProductImage(input: {
  id: string;
  altText: string;
  colorVariantId?: string | null;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
}): Promise<MediaActionResult> {
  try {
    const supabase = await authorizedClient();
    const { data: image, error: findError } = await supabase
      .from("product_images").select("product_id").eq("id", input.id).single();
    if (findError || !image) return { ok: false, message: "Product image not found." };
    if (input.isFeatured) {
      const { error: clearError } = await supabase.from("product_images")
        .update({ is_featured: false }).eq("product_id", image.product_id);
      if (clearError) return { ok: false, message: clearError.message };
    }
    const { error } = await supabase.from("product_images").update({
      alt_text: input.altText.trim().slice(0, 180),
      color_variant_id: input.colorVariantId || null,
      is_active: input.isActive,
      is_featured: input.isFeatured,
      display_order: Math.max(0, Math.trunc(input.displayOrder)),
    }).eq("id", input.id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { ok: true, message: "Product image updated." };
  } catch (error) {
    return unauthorized(error) ?? { ok: false, message: "Unable to update the product image." };
  }
}

export async function deleteProductImage(id: string): Promise<MediaActionResult> {
  try {
    const supabase = await authorizedClient();
    const { data: image, error: findError } = await supabase.from("product_images")
      .select("id,product_id,public_id,is_featured").eq("id", id).single();
    if (findError || !image) return { ok: false, message: "Product image not found." };
    if (image.public_id) {
      try {
        await destroyCloudinaryImage(image.public_id);
      } catch {
        return {
          ok: false,
          retryable: true,
          message: "Cloudinary could not delete this asset. The record was kept so you can retry cleanup.",
        };
      }
    }
    const { error } = await supabase.from("product_images").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    if (image.is_featured) {
      const { data: next } = await supabase.from("product_images").select("id")
        .eq("product_id", image.product_id).eq("is_active", true)
        .order("display_order").limit(1).maybeSingle();
      if (next) {
        const { error: promotionError } = await supabase
          .from("product_images")
          .update({ is_featured: true })
          .eq("id", next.id);
        if (promotionError) {
          return {
            ok: false,
            retryable: true,
            message: "The image was deleted, but the next featured image could not be promoted. Select a featured image and retry.",
          };
        }
      }
    }
    revalidatePath("/shop");
    revalidatePath("/admin/products");
    return { ok: true, message: "Product image deleted." };
  } catch (error) {
    return unauthorized(error) ?? { ok: false, message: "Unable to delete the product image." };
  }
}

export async function deleteProductAssets(productId: string): Promise<MediaActionResult> {
  try {
    const supabase = await authorizedClient();
    if (!/^[0-9a-f-]{36}$/i.test(productId)) return { ok: false, message: "Invalid product identifier." };
    const { data: images, error } = await supabase.from("product_images")
      .select("id,public_id").eq("product_id", productId);
    if (error) return { ok: false, message: error.message };

    const failedIds: string[] = [];
    for (const image of images ?? []) {
      if (image.public_id) {
        try {
          await destroyCloudinaryImage(image.public_id);
        } catch {
          failedIds.push(image.id);
          continue;
        }
      }
      const { error: deleteError } = await supabase.from("product_images").delete().eq("id", image.id);
      if (deleteError) failedIds.push(image.id);
    }

    if (failedIds.length) {
      return {
        ok: false,
        retryable: true,
        message: `${failedIds.length} product ${failedIds.length === 1 ? "asset" : "assets"} could not be cleaned up. The product was kept so cleanup can be retried.`,
      };
    }
    return { ok: true, message: "Product media cleaned up." };
  } catch (error) {
    return unauthorized(error) ?? { ok: false, message: "Unable to clean up product media." };
  }
}
