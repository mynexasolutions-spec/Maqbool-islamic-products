import { HomepageContentManager } from "@/components/admin/homepage-content-manager";
import { requireAdmin } from "@/lib/admin-authorization";
import type { HeroSlideRecord, HomeBannerRecord } from "@/lib/cloudinary/types";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminHomepagePage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const [heroResult, bannerResult, settingsResult] = await Promise.all([
    supabase.from("hero_slides").select("*").order("placement").order("display_order"),
    supabase.from("home_banner_images").select("*").order("display_order"),
    supabase.from("storefront_settings").select("home_banner_enabled").eq("id", true).maybeSingle(),
  ]);

  if (heroResult.error || bannerResult.error || settingsResult.error) {
    return <div role="alert" className="rounded-xl border border-[#e9c5bd] bg-[#fff4f1] p-6 text-sm text-[#8d3426]">Homepage content could not be loaded. Confirm the Supabase migration has been applied, then refresh this page.</div>;
  }

  return <HomepageContentManager initialHeroSlides={(heroResult.data ?? []) as HeroSlideRecord[]} initialBanners={(bannerResult.data ?? []) as HomeBannerRecord[]} initialBannerEnabled={settingsResult.data?.home_banner_enabled ?? true} />;
}
