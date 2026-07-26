import "server-only";

import type { GlobalFaqRecord, HeroSlideRecord, HomeBannerRecord } from "@/lib/cloudinary/types";
import { createClient } from "@/lib/supabase/server";

export type HomepageContent = {
  heroSlides: HeroSlideRecord[];
  banners: HomeBannerRecord[];
  faqs: GlobalFaqRecord[];
  bannerEnabled: boolean;
  available: boolean;
};

export async function getHomepageContent(): Promise<HomepageContent> {
  try {
    const supabase = await createClient();
    const [hero, banners, faqs, settings] = await Promise.all([
      supabase.from("hero_slides").select("*").eq("is_active", true).order("placement").order("display_order"),
      supabase.from("home_banner_images").select("*").eq("is_active", true).order("display_order"),
      supabase.from("global_faqs").select("*").eq("is_active", true).order("display_order"),
      supabase.from("storefront_settings").select("home_banner_enabled").eq("id", true).maybeSingle(),
    ]);
    if (hero.error || banners.error || faqs.error || settings.error) throw new Error("Homepage query failed.");
    return {
      heroSlides: (hero.data ?? []) as HeroSlideRecord[],
      banners: (banners.data ?? []) as HomeBannerRecord[],
      faqs: (faqs.data ?? []) as GlobalFaqRecord[],
      bannerEnabled: settings.data?.home_banner_enabled ?? true,
      available: true,
    };
  } catch {
    return { heroSlides: [], banners: [], faqs: [], bannerEnabled: false, available: false };
  }
}
