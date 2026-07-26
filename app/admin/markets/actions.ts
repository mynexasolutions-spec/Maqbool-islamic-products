"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export type AdminMarket = {
  id: string;
  code: string;
  slug: string;
  name: string;
  currencyCode: string;
  isActive: boolean;
  taxLabel: string;
  taxRate: number;
  taxAppliesToShipping: boolean;
  shippingFee: number;
  freeShippingThreshold: number | null;
  codFee: number;
  codEnabled: boolean;
  onlineEnabled: boolean;
  deliveryEstimate: string;
  configurationComplete: boolean;
};

export type MarketOffer = {
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  prices: Record<string, { price: number; compareAtPrice: number | null; isActive: boolean } | undefined>;
};

function failure(error: unknown) {
  return { ok: false as const, error: error instanceof AdminAuthorizationError ? "Your admin session has expired." : error instanceof Error ? error.message : "Unable to save market settings." };
}

export async function getAdminMarkets(): Promise<AdminMarket[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const [markets, settings] = await Promise.all([
    supabase.from("markets").select("*").order("display_order"),
    supabase.from("market_checkout_settings").select("*"),
  ]);
  const error = markets.error ?? settings.error;
  if (error) throw new Error(error.message);
  return (markets.data ?? []).map((market) => {
    const config = settings.data?.find((item) => item.market_id === market.id);
    return {
      id: market.id,
      code: market.code,
      slug: market.slug,
      name: market.name,
      currencyCode: market.currency_code,
      isActive: market.is_active,
      taxLabel: config?.tax_label ?? "Tax",
      taxRate: Number(config?.tax_rate ?? 0),
      taxAppliesToShipping: config?.tax_applies_to_shipping ?? false,
      shippingFee: Number(config?.shipping_fee ?? 0),
      freeShippingThreshold: config?.free_shipping_threshold === null || config?.free_shipping_threshold === undefined ? null : Number(config.free_shipping_threshold),
      codFee: Number(config?.cod_fee ?? 0),
      codEnabled: config?.cod_enabled ?? true,
      onlineEnabled: config?.online_enabled ?? true,
      deliveryEstimate: config?.delivery_estimate ?? "3–7 business days",
      configurationComplete: config?.configuration_complete ?? false,
    };
  });
}

export async function getMarketOffers(): Promise<MarketOffer[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const [variants, products, offers, markets] = await Promise.all([
    supabase.from("product_variants").select("*").eq("is_active", true).order("display_order"),
    supabase.from("products").select("id,name").eq("is_active", true).order("name"),
    supabase.from("variant_market_prices").select("*"),
    supabase.from("markets").select("id,slug"),
  ]);
  const error = variants.error ?? products.error ?? offers.error ?? markets.error;
  if (error) throw new Error(error.message);
  return (variants.data ?? []).map((variant) => ({
    variantId: variant.id,
    productName: products.data?.find((product) => product.id === variant.product_id)?.name ?? "Product",
    variantName: `${variant.name}: ${variant.value}`,
    sku: variant.sku,
    prices: Object.fromEntries((markets.data ?? []).map((market) => {
      const offer = offers.data?.find((item) => item.variant_id === variant.id && item.market_id === market.id);
      return [market.slug, offer ? { price: Number(offer.price), compareAtPrice: offer.compare_at_price === null ? null : Number(offer.compare_at_price), isActive: offer.is_active } : undefined];
    })),
  }));
}

export async function saveMarket(input: AdminMarket) {
  try {
    await requireAdmin();
    const numeric = [input.taxRate, input.shippingFee, input.codFee];
    if (numeric.some((value) => !Number.isFinite(value) || value < 0) || input.taxRate > 100) throw new Error("Enter valid non-negative rates and fees.");
    if (input.isActive && !input.configurationComplete) throw new Error("Mark the configuration complete before activating this market.");
    const supabase = createAdminClient();
    if (input.isActive) {
      const { count, error: priceError } = await supabase.from("variant_market_prices").select("id", { count: "exact", head: true }).eq("market_id", input.id).eq("is_active", true);
      if (priceError) throw new Error(priceError.message);
      if (!count) throw new Error("Add at least one active variant price before activating this market.");
    }
    const [market, settings] = await Promise.all([
      supabase.from("markets").update({ is_active: input.isActive }).eq("id", input.id),
      supabase.from("market_checkout_settings").update({
        tax_label: input.taxLabel.trim() || "Tax",
        tax_rate: input.taxRate,
        tax_applies_to_shipping: input.taxAppliesToShipping,
        shipping_fee: input.shippingFee,
        free_shipping_threshold: input.freeShippingThreshold,
        cod_fee: input.codFee,
        cod_enabled: input.codEnabled,
        online_enabled: input.onlineEnabled,
        delivery_estimate: input.deliveryEstimate.trim(),
        configuration_complete: input.configurationComplete,
      }).eq("market_id", input.id),
    ]);
    if (market.error || settings.error) throw new Error(market.error?.message ?? settings.error?.message);
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/markets");
    revalidatePath("/admin/shipping");
    return { ok: true as const, message: `${input.name} settings saved.` };
  } catch (error) {
    return failure(error);
  }
}

export async function saveMarketOffer(input: { marketId: string; variantId: string; price: number; compareAtPrice: number | null; isActive: boolean }) {
  try {
    await requireAdmin();
    if (!Number.isFinite(input.price) || input.price < 0) throw new Error("Enter a valid market price.");
    if (input.compareAtPrice !== null && input.compareAtPrice < input.price) throw new Error("Compare-at price must be at least the selling price.");
    const supabase = createAdminClient();
    const { error } = await supabase.from("variant_market_prices").upsert({
      market_id: input.marketId,
      variant_id: input.variantId,
      price: input.price,
      compare_at_price: input.compareAtPrice,
      is_active: input.isActive,
    }, { onConflict: "variant_id,market_id" });
    if (error) throw new Error(error.message);
    revalidatePath("/");
    revalidatePath("/shop");
    revalidatePath("/admin/markets");
    return { ok: true as const, message: "Variant market price saved." };
  } catch (error) {
    return failure(error);
  }
}
