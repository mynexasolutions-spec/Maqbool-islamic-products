import type { ProductInput } from "@/components/admin/catalog-types";

type StoredProductDraft = {
  version: 1;
  savedAt: string;
  product: ProductInput;
};

export function productDraftStorageKey(productId: string) {
  return `maqbool:admin:product-draft:${productId}`;
}

export function serializeProductDraft(product: ProductInput, savedAt = new Date()) {
  const draft: StoredProductDraft = {
    version: 1,
    savedAt: savedAt.toISOString(),
    product,
  };
  return JSON.stringify(draft);
}

export function parseProductDraft(value: string, expectedProductId: string): ProductInput | null {
  try {
    const parsed = JSON.parse(value) as Partial<StoredProductDraft>;
    if (
      parsed.version !== 1 ||
      !parsed.product ||
      parsed.product.id !== expectedProductId ||
      !Array.isArray(parsed.product.variants) ||
      !Array.isArray(parsed.product.information) ||
      !Array.isArray(parsed.product.faqs)
    ) {
      return null;
    }
    return parsed.product;
  } catch {
    return null;
  }
}
