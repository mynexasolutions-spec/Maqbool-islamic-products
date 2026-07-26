import { describe, expect, it } from "vitest";
import type { ProductInput } from "@/components/admin/catalog-types";
import {
  parseProductDraft,
  productDraftStorageKey,
  serializeProductDraft,
} from "@/lib/admin-product-draft";

const product: ProductInput = {
  id: "new",
  categoryId: "category-1",
  name: "Prayer Mat",
  slug: "prayer-mat",
  description: "A soft prayer mat.",
  price: 499,
  compareAtPrice: null,
  rating: 0,
  reviewCount: 0,
  badge: "",
  isFeatured: false,
  isActive: true,
  displayOrder: 0,
  seoTitle: "",
  seoDescription: "",
  variants: [],
  information: [],
  faqs: [],
};

describe("admin product drafts", () => {
  it("uses a separate key for each editor", () => {
    expect(productDraftStorageKey("new")).toBe("maqbool:admin:product-draft:new");
    expect(productDraftStorageKey("product-1")).toBe("maqbool:admin:product-draft:product-1");
  });

  it("round-trips a matching versioned draft", () => {
    const stored = serializeProductDraft(product, new Date("2026-07-27T00:00:00.000Z"));
    expect(parseProductDraft(stored, "new")).toEqual(product);
  });

  it("rejects malformed, stale, and wrong-product drafts", () => {
    expect(parseProductDraft("not-json", "new")).toBeNull();
    expect(parseProductDraft(JSON.stringify({ version: 2, product }), "new")).toBeNull();
    expect(parseProductDraft(serializeProductDraft(product), "another-product")).toBeNull();
  });
});
