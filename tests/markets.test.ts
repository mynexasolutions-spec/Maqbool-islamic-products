import { describe, expect, it } from "vitest";
import { calculateMarketCheckout } from "@/lib/commerce";
import { formatMoney, marketHref, stripMarketPrefix } from "@/lib/markets";
import type { CartItem } from "@/lib/models";

const item: CartItem = {
  id: "line-1",
  productId: "product-1",
  slug: "test-product",
  name: "Test product",
  image: "",
  variantId: "variant-1",
  variantName: "Standard",
  price: 100,
  quantity: 2,
  stock: 5,
  marketSlug: "sa",
  currencyCode: "SAR",
};

describe("multi-market commerce", () => {
  it("creates stable market URLs without duplicate prefixes", () => {
    expect(marketHref("sa", "/shop/item")).toBe("/sa/shop/item");
    expect(marketHref("qa", "/in/shop/item")).toBe("/qa/shop/item");
    expect(marketHref("my", "/about#authenticity")).toBe("/my/about#authenticity");
    expect(stripMarketPrefix("/dubai/checkout")).toBe("/checkout");
  });

  it("formats values in the selected currency", () => {
    expect(formatMoney(12.5, "sa")).toContain("12.50");
    expect(formatMoney(12.5, "sa")).toMatch(/SAR|ر\.س/);
  });

  it("calculates discount, shipping, tax, and COD from market settings", () => {
    expect(calculateMarketCheckout([item], "MAQBOOL10", "cod", {
      taxLabel: "VAT",
      taxRate: 15,
      taxAppliesToShipping: false,
      shippingFee: 20,
      freeShippingThreshold: 500,
      codFee: 5,
      codEnabled: true,
      onlineEnabled: true,
      deliveryEstimate: "3 days",
    })).toEqual({
      subtotal: 200,
      discount: 20,
      shipping: 20,
      tax: 27,
      codCharge: 5,
      total: 232,
    });
  });
});
