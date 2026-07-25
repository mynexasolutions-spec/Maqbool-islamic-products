import { describe, expect, it } from "vitest";
import { calculateCheckout } from "@/lib/commerce";
import type { CartItem } from "@/lib/models";

const item: CartItem = {
  id: "quran-standard",
  productId: "quran",
  slug: "holy-quran",
  name: "Holy Quran",
  image: "/quran.webp",
  variantId: "standard",
  variantName: "Standard",
  price: 500,
  quantity: 2,
  stock: 5,
};

describe("checkout calculations", () => {
  it("applies free shipping and MAQBOOL10 case-insensitively", () => {
    expect(calculateCheckout([item], "maqbool10", "online")).toEqual({
      subtotal: 1000,
      shipping: 0,
      discount: 100,
      codCharge: 0,
      total: 900,
    });
  });

  it("adds shipping and COD charge below the threshold", () => {
    const result = calculateCheckout([{ ...item, quantity: 1 }], "", "cod");
    expect(result).toMatchObject({ subtotal: 500, shipping: 79, discount: 0, codCharge: 39, total: 618 });
  });

  it("does not charge an empty cart", () => {
    expect(calculateCheckout([], "MAQBOOL10", "cod").total).toBe(0);
  });
});

