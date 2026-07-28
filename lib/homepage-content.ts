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

export type HomepageReview = {
  id: string;
  customerName: string;
  rating: number;
  body: string;
  productName: string;
  createdAt: string;
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

export async function getHomepageReviews(limit = 6): Promise<HomepageReview[]> {
  try {
    const supabase = await createClient();
    const { data: reviews, error: reviewsError } = await supabase
      .from("product_reviews")
      .select("id,product_id,customer_name,rating,body,created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(Math.min(6, Math.max(1, limit)));
    if (reviewsError) throw reviewsError;
    if (!reviews?.length) return [];

    const productIds = [...new Set(reviews.map((review) => review.product_id))];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id,name")
      .in("id", productIds);
    if (productsError) throw productsError;
    const productNames = new Map((products ?? []).map((product) => [product.id, product.name]));

    return reviews.map((review) => ({
      id: review.id,
      customerName: review.customer_name,
      rating: review.rating,
      body: review.body,
      productName: productNames.get(review.product_id) ?? "Maqbool Islamic Product",
      createdAt: review.created_at,
    }));
  } catch {
    return [];
  }
}
