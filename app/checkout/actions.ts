"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { isMarketSlug, MARKETS, type MarketSlug } from "@/lib/markets";
import type { Address, PaymentMethod } from "@/lib/models";

type CheckoutInput = {
  marketSlug: string;
  items: Array<{ variantId: string; quantity: number }>;
  customer: { name: string; phone: string };
  address: Address;
  paymentMethod: PaymentMethod;
  coupon: string;
};

type PlacedOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  marketCode: string;
  currencyCode: string;
  subtotal: number;
  discount: number;
  shipping: number;
  taxLabel: string;
  taxRate: number;
  tax: number;
  codFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: "pending" | "simulated";
  status: "confirmed";
};

function validateAddress(marketSlug: MarketSlug, address: Address) {
  const market = MARKETS[marketSlug];
  if (!address.name.trim() || !address.line1.trim() || !address.city.trim() || !address.state.trim()) {
    throw new Error("Complete all required delivery fields.");
  }
  const phone = address.phone.replace(/\D/g, "");
  if (phone.length < 7 || phone.length > 15) throw new Error("Enter a valid mobile number.");
  if (address.countryCode !== market.countryCode) throw new Error(`The delivery country must match ${market.name}.`);
  const postal = address.pincode.trim();
  if (marketSlug === "in" && !/^\d{6}$/.test(postal)) throw new Error("Enter a valid 6-digit Indian pincode.");
  if ((marketSlug === "sa" || marketSlug === "my") && !/^\d{5}$/.test(postal)) throw new Error("Enter a valid 5-digit postal code.");
  if (marketSlug === "dubai" && !`${address.city} ${address.state}`.toLowerCase().includes("dubai")) {
    throw new Error("The Dubai market only accepts delivery addresses in Dubai.");
  }
}

export async function placeOrder(input: CheckoutInput): Promise<{ ok: true; order: PlacedOrder } | { ok: false; error: string }> {
  try {
    if (!isMarketSlug(input.marketSlug)) throw new Error("Choose a valid shopping market.");
    if (!input.customer.name.trim()) throw new Error("Customer name is required.");
    validateAddress(input.marketSlug, input.address);
    if (!input.items.length || input.items.some((item) => !item.variantId || !Number.isInteger(item.quantity) || item.quantity < 1)) {
      throw new Error("Your bag contains an invalid item.");
    }
    const supabase = createAdminClient();
    const { data, error } = await supabase.rpc("place_market_order", {
      market_slug_input: input.marketSlug,
      items_input: input.items,
      customer_input: input.customer,
      address_input: input.address,
      payment_method_input: input.paymentMethod,
      coupon_input: input.coupon || null,
    });
    if (error) throw new Error(error.message);
    const order = data as unknown as PlacedOrder;
    return {
      ok: true,
      order: {
        ...order,
        subtotal: Number(order.subtotal),
        discount: Number(order.discount),
        shipping: Number(order.shipping),
        taxRate: Number(order.taxRate),
        tax: Number(order.tax),
        codFee: Number(order.codFee),
        total: Number(order.total),
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unable to place your order." };
  }
}

export async function validateCoupon(input: { marketSlug: string; code: string; subtotal: number }) {
  try {
    if (!isMarketSlug(input.marketSlug) || !input.code.trim()) throw new Error("Enter a valid coupon.");
    const supabase = createAdminClient();
    const { data: market, error: marketError } = await supabase.from("markets").select("id").eq("slug", input.marketSlug).single();
    if (marketError || !market) throw new Error("Market is unavailable.");
    const { data, error } = await supabase.from("coupons").select("*")
      .eq("market_id", market.id).eq("code", input.code.trim().toUpperCase()).eq("is_active", true).maybeSingle();
    const now = Date.now();
    if (error || !data || (data.starts_at && Date.parse(data.starts_at) > now) || (data.ends_at && Date.parse(data.ends_at) < now)
      || (data.usage_limit !== null && data.usage_count >= data.usage_limit)) {
      throw new Error("This coupon is not valid for the selected market.");
    }
    if (input.subtotal < Number(data.minimum_purchase)) throw new Error(`Minimum purchase is ${Number(data.minimum_purchase)}.`);
    return { ok: true as const, coupon: { code: data.code, type: data.discount_type, value: Number(data.discount_value) } };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Unable to validate coupon." };
  }
}
