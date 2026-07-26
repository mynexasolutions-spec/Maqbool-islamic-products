import { describe, expect, it } from "vitest";
import { parseCatalogSearchParams } from "@/components/catalog/catalog-search-params";

describe("storefront catalog query parsing", () => {
  it("preserves repeated categories and supported filters", () => {
    const parsed = parseCatalogSearchParams({
      q: "  prayer mat ",
      category: ["prayer-mats", "islamic-gifts"],
      minPrice: "300",
      maxPrice: "1500",
      rating: "4.5",
      sort: "rating",
      page: "2",
    });

    expect(parsed.filters).toEqual({
      search: "prayer mat",
      categories: ["prayer-mats", "islamic-gifts"],
      minPrice: "300",
      maxPrice: "1500",
      minRating: 4.5,
      sort: "rating",
    });
    expect(parsed.query).toMatchObject({ minPrice: 300, maxPrice: 1500, page: 2, pageSize: 8 });
  });

  it("safely defaults malformed numeric and sort values", () => {
    const parsed = parseCatalogSearchParams({
      minPrice: "-10",
      maxPrice: "many",
      rating: "NaN",
      sort: "unknown",
      page: "0",
    });

    expect(parsed.query).toMatchObject({
      minPrice: undefined,
      maxPrice: undefined,
      minRating: 0,
      sort: "featured",
      page: 1,
    });
  });
});
