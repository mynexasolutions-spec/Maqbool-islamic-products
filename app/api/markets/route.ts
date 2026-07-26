import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const [markets, settings] = await Promise.all([
    supabase.from("markets").select("*").eq("is_active", true).order("display_order"),
    supabase.from("market_checkout_settings").select("*"),
  ]);
  if (markets.error || settings.error) {
    return NextResponse.json({ error: "Markets are temporarily unavailable." }, { status: 503 });
  }
  return NextResponse.json({
    markets: (markets.data ?? []).map((market) => {
      const config = settings.data?.find((item) => item.market_id === market.id);
      return {
        code: market.code,
        slug: market.slug,
        name: market.name,
        countryCode: market.country_code,
        currencyCode: market.currency_code,
        locale: market.locale,
        settings: config ? {
          taxLabel: config.tax_label,
          taxRate: Number(config.tax_rate),
          taxAppliesToShipping: config.tax_applies_to_shipping,
          shippingFee: Number(config.shipping_fee),
          freeShippingThreshold: config.free_shipping_threshold === null ? null : Number(config.free_shipping_threshold),
          codFee: Number(config.cod_fee),
          codEnabled: config.cod_enabled,
          onlineEnabled: config.online_enabled,
          deliveryEstimate: config.delivery_estimate,
        } : null,
      };
    }),
  });
}
