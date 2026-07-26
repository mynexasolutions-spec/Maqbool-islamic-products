import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { calculateMarketCheckout } from "@/lib/commerce";
import type { CartItem } from "@/lib/models";

const settings = {
  taxLabel: "Tax",
  taxRate: 10,
  taxAppliesToShipping: false,
  shippingFee: 50,
  freeShippingThreshold: 1000,
  codFee: 20,
  codEnabled: true,
  onlineEnabled: true,
  deliveryEstimate: "3–7 days",
};
const items = [{ price: 500, quantity: 2 }] as CartItem[];

describe("market-specific coupons", () => {
  it("calculates percentage discounts before tax and shipping", () => {
    expect(calculateMarketCheckout(items, "SAVE15", "online", settings, { type: "percentage", value: 15 }))
      .toEqual({ subtotal: 1000, discount: 150, shipping: 50, tax: 85, codCharge: 0, total: 985 });
  });

  it("caps flat discounts at the subtotal", () => {
    const total = calculateMarketCheckout(items, "FREE", "online", settings, { type: "flat", value: 2000 });
    expect(total.discount).toBe(1000);
    expect(total.total).toBe(50);
  });
});

describe("admin operations migration", () => {
  const sql = readFileSync("supabase/migrations/20260728000000_admin_operations.sql", "utf8");

  it("keeps privileged operational tables unavailable for public mutation", () => {
    expect(sql).toContain("revoke all on public.customer_profiles from anon, authenticated");
    expect(sql).toContain("revoke all on public.coupons from anon, authenticated");
    expect(sql).toContain("revoke insert, update, delete on public.product_reviews from anon, authenticated");
  });

  it("enforces suspended customers and order event tracking in the database", () => {
    expect(sql).toContain("create trigger block_suspended_customer_order before insert on public.orders");
    expect(sql).toContain("create trigger record_order_event after insert or update of status on public.orders");
  });
});
