export type ShopSearchParams = Record<string, string | string[] | undefined>;
export type StorefrontSort = "featured" | "newest" | "price-asc" | "price-desc" | "rating";

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function nonNegativeNumber(value: string | undefined) {
  if (!value?.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function validSort(value: string | undefined): StorefrontSort {
  return ["newest", "price-asc", "price-desc", "rating"].includes(value ?? "")
    ? value as StorefrontSort
    : "featured";
}

export function parseCatalogSearchParams(params: ShopSearchParams) {
  const categories = Array.isArray(params.category)
    ? params.category.filter(Boolean)
    : params.category ? [params.category] : [];
  const search = first(params.q)?.trim() ?? "";
  const minPrice = first(params.minPrice) ?? "";
  const maxPrice = first(params.maxPrice) ?? "";
  const minRating = nonNegativeNumber(first(params.rating)) ?? 0;
  const sort = validSort(first(params.sort));
  const page = Math.max(1, Math.trunc(nonNegativeNumber(first(params.page)) ?? 1));

  return {
    filters: { search, categories, minPrice, maxPrice, minRating, sort },
    query: {
      search,
      categories,
      minPrice: nonNegativeNumber(minPrice),
      maxPrice: nonNegativeNumber(maxPrice),
      minRating,
      sort,
      page,
      pageSize: 6,
    },
  };
}
