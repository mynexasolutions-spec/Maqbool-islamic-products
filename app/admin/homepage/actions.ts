"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import { destroyCloudinaryImage } from "@/lib/cloudinary/server";
import type { CloudinaryUploadAsset, MediaActionResult } from "@/lib/cloudinary/types";
import { CLOUDINARY_ALLOWED_FORMATS } from "@/lib/cloudinary/scopes";
import { createAdminClient } from "@/lib/supabase/admin";

function cleanText(value: string, max: number) {
  return value.trim().slice(0, max);
}

function validLink(value?: string | null) {
  const link = value?.trim() || null;
  if (!link) return null;
  if (link.startsWith("/") && !link.startsWith("//")) return link.slice(0, 500);
  try {
    const url = new URL(link);
    return url.protocol === "https:" ? url.toString().slice(0, 500) : null;
  } catch {
    return null;
  }
}

function validAsset(asset: CloudinaryUploadAsset, folder: "hero" | "home-banner") {
  return asset.resourceType === "image" &&
    asset.publicId.startsWith(`maqbool/${folder}/`) &&
    asset.secureUrl.startsWith("https://res.cloudinary.com/") &&
    CLOUDINARY_ALLOWED_FORMATS.includes(asset.format.toLowerCase() as typeof CLOUDINARY_ALLOWED_FORMATS[number]) &&
    asset.bytes > 0 && asset.bytes <= 10 * 1024 * 1024 &&
    asset.width > 0 && asset.height > 0;
}

async function client() {
  await requireAdmin();
  return createAdminClient();
}

function failure(error: unknown, fallback: string): MediaActionResult {
  return {
    ok: false,
    message: error instanceof AdminAuthorizationError
      ? "Your admin session has expired. Please sign in again."
      : fallback,
  };
}

export async function createHeroSlide(input: {
  placement: "left" | "right";
  title: string;
  subtitle: string;
  altText: string;
  linkUrl?: string | null;
  asset: CloudinaryUploadAsset;
}): Promise<MediaActionResult> {
  try {
    const supabase = await client();
    if (!["left", "right"].includes(input.placement) || !validAsset(input.asset, "hero")) {
      return { ok: false, message: "The hero slide metadata is invalid." };
    }
    const { count, error: countError } = await supabase.from("hero_slides")
      .select("id", { count: "exact", head: true }).eq("placement", input.placement);
    if (countError) return { ok: false, message: countError.message };
    if ((count ?? 0) >= 5) return { ok: false, message: `The ${input.placement} placement already has five slides.` };
    const { data, error } = await supabase.from("hero_slides").insert({
      placement: input.placement,
      title: cleanText(input.title, 120),
      subtitle: cleanText(input.subtitle, 240),
      secure_url: input.asset.secureUrl,
      public_id: input.asset.publicId,
      resource_type: "image",
      format: input.asset.format,
      width: input.asset.width,
      height: input.asset.height,
      bytes: input.asset.bytes,
      alt_text: cleanText(input.altText, 180) || cleanText(input.title, 120) || "Maqbool featured collection",
      link_url: validLink(input.linkUrl),
      is_active: true,
      display_order: count ?? 0,
    }).select("id").single();
    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { ok: true, id: data.id, message: "Hero slide saved." };
  } catch (error) {
    return failure(error, "Unable to save the hero slide.");
  }
}

export async function updateHeroSlide(input: {
  id: string;
  placement: "left" | "right";
  title: string;
  subtitle: string;
  altText: string;
  linkUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
}): Promise<MediaActionResult> {
  try {
    const supabase = await client();
    const { data: current, error: currentError } = await supabase
      .from("hero_slides").select("placement").eq("id", input.id).single();
    if (currentError || !current) return { ok: false, message: "Hero slide not found." };
    if (current.placement !== input.placement) {
      const { count, error: countError } = await supabase.from("hero_slides")
        .select("id", { count: "exact", head: true }).eq("placement", input.placement);
      if (countError) return { ok: false, message: countError.message };
      if ((count ?? 0) >= 5) return { ok: false, message: `The ${input.placement} placement already has five slides.` };
    }
    const { error } = await supabase.from("hero_slides").update({
      placement: input.placement,
      title: cleanText(input.title, 120),
      subtitle: cleanText(input.subtitle, 240),
      alt_text: cleanText(input.altText, 180) || cleanText(input.title, 120) || "Maqbool featured collection",
      link_url: validLink(input.linkUrl),
      is_active: input.isActive,
      display_order: Math.max(0, Math.trunc(input.displayOrder)),
    }).eq("id", input.id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { ok: true, message: "Hero slide updated." };
  } catch (error) {
    return failure(error, "Unable to update the hero slide.");
  }
}

export async function deleteHeroSlide(id: string): Promise<MediaActionResult> {
  try {
    const supabase = await client();
    const { data, error } = await supabase.from("hero_slides").select("public_id").eq("id", id).single();
    if (error || !data) return { ok: false, message: "Hero slide not found." };
    try {
      await destroyCloudinaryImage(data.public_id);
    } catch {
      return { ok: false, retryable: true, message: "Cloudinary cleanup failed. The slide was kept so deletion can be retried." };
    }
    const { error: deleteError } = await supabase.from("hero_slides").delete().eq("id", id);
    if (deleteError) return { ok: false, message: deleteError.message };
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { ok: true, message: "Hero slide deleted." };
  } catch (error) {
    return failure(error, "Unable to delete the hero slide.");
  }
}

export async function createHomeBanner(input: {
  title: string;
  altText: string;
  linkUrl?: string | null;
  asset: CloudinaryUploadAsset;
}): Promise<MediaActionResult> {
  try {
    const supabase = await client();
    if (!validAsset(input.asset, "home-banner")) return { ok: false, message: "The banner metadata is invalid." };
    const { count, error: countError } = await supabase.from("home_banner_images").select("id", { count: "exact", head: true });
    if (countError) return { ok: false, message: countError.message };
    if ((count ?? 0) >= 8) return { ok: false, message: "The homepage already has eight banner images." };
    const { data, error } = await supabase.from("home_banner_images").insert({
      title: cleanText(input.title, 120),
      alt_text: cleanText(input.altText, 180),
      secure_url: input.asset.secureUrl,
      public_id: input.asset.publicId,
      resource_type: "image",
      format: input.asset.format,
      width: input.asset.width,
      height: input.asset.height,
      bytes: input.asset.bytes,
      link_url: validLink(input.linkUrl),
      is_active: true,
      display_order: count ?? 0,
    }).select("id").single();
    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { ok: true, id: data.id, message: "Home banner saved." };
  } catch (error) {
    return failure(error, "Unable to save the home banner.");
  }
}

export async function updateHomeBanner(input: {
  id: string;
  title: string;
  altText: string;
  linkUrl?: string | null;
  isActive: boolean;
  displayOrder: number;
}): Promise<MediaActionResult> {
  try {
    const supabase = await client();
    const { error } = await supabase.from("home_banner_images").update({
      title: cleanText(input.title, 120),
      alt_text: cleanText(input.altText, 180),
      link_url: validLink(input.linkUrl),
      is_active: input.isActive,
      display_order: Math.max(0, Math.trunc(input.displayOrder)),
    }).eq("id", input.id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { ok: true, message: "Home banner updated." };
  } catch (error) {
    return failure(error, "Unable to update the home banner.");
  }
}

export async function deleteHomeBanner(id: string): Promise<MediaActionResult> {
  try {
    const supabase = await client();
    const { data, error } = await supabase.from("home_banner_images").select("public_id").eq("id", id).single();
    if (error || !data) return { ok: false, message: "Home banner not found." };
    try {
      await destroyCloudinaryImage(data.public_id);
    } catch {
      return { ok: false, retryable: true, message: "Cloudinary cleanup failed. The banner was kept so deletion can be retried." };
    }
    const { error: deleteError } = await supabase.from("home_banner_images").delete().eq("id", id);
    if (deleteError) return { ok: false, message: deleteError.message };
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { ok: true, message: "Home banner deleted." };
  } catch (error) {
    return failure(error, "Unable to delete the home banner.");
  }
}

export async function setHomeBannerEnabled(enabled: boolean): Promise<MediaActionResult> {
  try {
    const supabase = await client();
    const { error } = await supabase.from("storefront_settings").upsert({
      id: true,
      home_banner_enabled: enabled,
    }, { onConflict: "id" });
    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/admin/homepage");
    return { ok: true, message: `Home banners ${enabled ? "enabled" : "disabled"}.` };
  } catch (error) {
    return failure(error, "Unable to update home banner visibility.");
  }
}
