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
