import "server-only";

import type { Category, Product } from "@/lib/models";
import type { Tables } from "@/lib/database.types";
import { createClient } from "@/lib/supabase/server";
import { getRequestMarketSlug } from "@/lib/market-server";
import { MARKETS, type MarketSlug } from "@/lib/markets";

export type CatalogSort = "featured" | "popular" | "newest" | "price-asc" | "price-desc" | "rating" | "name";
export type CatalogQuery = {
  search?: string;
  category?: string;
  categories?: string[];
  sort?: CatalogSort;
  page?: number;
  pageSize?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  market?: MarketSlug;
};
export type CatalogCategory = Category & { productCount: number };
export type CatalogPage = {
  products: Product[];
  categories: CatalogCategory[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export class CatalogRepositoryError extends Error {
  constructor() {
    super("The catalog is temporarily unavailable.");
    this.name = "CatalogRepositoryError";
  }
}

type ProductRow = Tables<"products">;
type CategoryRow = Tables<"categories">;
type VariantRow = Tables<"product_variants">;
type ImageRow = Tables<"product_images">;
type InformationRow = Tables<"product_information">;
type FaqRow = Tables<"product_faqs">;
type OfferRow = Tables<"variant_market_prices">;
type ReviewRow = Tables<"product_reviews">;

async function resolveMarket(slug?: MarketSlug) {
  const marketSlug = slug ?? await getRequestMarketSlug();
  const client = await createClient();
  const { data, error } = await client.from("markets").select("*").eq("slug", marketSlug).eq("is_active", true).maybeSingle();
  if (error || !data) throw new CatalogRepositoryError();
  return { marketSlug, marketId: data.id, currencyCode: data.currency_code };
}

async function loadCategories() {
  const client = await createClient();
  const { data, error } = await client.from("categories").select("*").eq("is_active", true).order("display_order").order("name");
  if (error) throw new CatalogRepositoryError();
  return (data ?? []) as CategoryRow[];
}

async function composeProducts(rows: ProductRow[], categories: CategoryRow[], marketSlug: MarketSlug, marketId: string, currencyCode: string) {
  if (!rows.length) return [];
  const client = await createClient();
  const ids = rows.map((row) => row.id);
  const [variants, images, information, faqs, reviews] = await Promise.all([
    client.from("product_variants").select("*").in("product_id", ids),
    client.from("product_images").select("*").in("product_id", ids),
    client.from("product_information").select("*").in("product_id", ids),
    client.from("product_faqs").select("*").in("product_id", ids),
    client.from("product_reviews").select("*").in("product_id", ids).eq("status", "approved"),
  ]);
  const firstError = [variants.error, images.error, information.error, faqs.error, reviews.error].find(Boolean);
  if (firstError) throw new CatalogRepositoryError();
  const variantRows = (variants.data ?? []) as VariantRow[];
  const variantIds = variantRows.map((item) => item.id);
  const offers = variantIds.length
    ? await client.from("variant_market_prices").select("*").eq("market_id", marketId).in("variant_id", variantIds).eq("is_active", true)
    : { data: [] as OfferRow[], error: null };
  if (offers.error) throw new CatalogRepositoryError();
  const offerByVariant = new Map(((offers.data ?? []) as OfferRow[]).map((offer) => [offer.variant_id, offer]));
  const categoryById = new Map(categories.map((category) => [category.id, category]));

  return rows.flatMap<Product>((row) => {
    const category = categoryById.get(row.category_id);
    if (!category) return [];
    const productVariants = variantRows
      .filter((variant) => variant.product_id === row.id && variant.is_active && offerByVariant.has(variant.id))
      .sort((a, b) => a.display_order - b.display_order)
      .map((variant) => {
        const offer = offerByVariant.get(variant.id)!;
        return {
          id: variant.id,
          name: variant.name,
          value: variant.value,
          price: Number(offer.price),
          originalPrice: offer.compare_at_price === null ? undefined : Number(offer.compare_at_price),
          stock: variant.stock,
          color: variant.color ?? undefined,
          image: variant.image_url ?? undefined,
        };
      });
    if (!productVariants.length) return [];
    const lowest = productVariants.reduce((best, variant) => variant.price < best.price ? variant : best);
    const imageRows = (images.data ?? []) as ImageRow[];
    const informationRows = (information.data ?? []) as InformationRow[];
    const faqRows = (faqs.data ?? []) as FaqRow[];
    const reviewRows = (reviews.data ?? []) as ReviewRow[];
    return [{
      id: row.id,
      slug: row.slug,
      name: row.name,
      category: category.name,
      description: row.description,
      price: lowest.price,
      originalPrice: lowest.originalPrice,
      rating: Number(row.rating),
      reviewCount: row.review_count,
      featured: row.is_featured,
      createdAt: row.created_at,
      active: row.is_active,
      badge: row.badge ?? undefined,
      marketSlug,
      currencyCode,
      seoTitle: row.seo_title ?? undefined,
      seoDescription: row.seo_description ?? undefined,
      images: imageRows.filter((image) => image.product_id === row.id && image.is_active)
        .sort((a, b) => Number(b.is_featured) - Number(a.is_featured) || a.display_order - b.display_order)
        .map((image) => ({ id: image.id, src: image.secure_url, alt: image.alt_text })),
      variants: productVariants,
      specifications: Object.fromEntries(informationRows.filter((item) => item.product_id === row.id)
        .sort((a, b) => a.display_order - b.display_order).map((item) => [item.label, item.value])),
      faqs: faqRows.filter((faq) => faq.product_id === row.id && faq.is_active)
        .sort((a, b) => a.display_order - b.display_order).map(({ question, answer }) => ({ question, answer })),
      reviews: reviewRows.filter((review) => review.product_id === row.id)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .map((review) => ({ id: review.id, name: review.customer_name, rating: review.rating, body: review.body, createdAt: review.created_at })),
    }];
  });
}

async function loadMarketCatalog(market?: MarketSlug) {
  const [{ marketSlug, marketId, currencyCode }, categories] = await Promise.all([resolveMarket(market), loadCategories()]);
  const client = await createClient();
  const { data, error } = await client.from("products").select("*").eq("is_active", true);
  if (error) throw new CatalogRepositoryError();
  const products = await composeProducts((data ?? []) as ProductRow[], categories, marketSlug, marketId, currencyCode);
  return { products, categories };
}

function categoriesWithCounts(categories: CategoryRow[], products: Product[]): CatalogCategory[] {
  return categories.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description ?? undefined,
    active: row.is_active,
    productCount: products.filter((product) => product.category === row.name).length,
  }));
}

export async function getActiveCategories(market?: MarketSlug) {
  try {
    const catalog = await loadMarketCatalog(market);
    return categoriesWithCounts(catalog.categories, catalog.products);
  } catch (error) {
    if (error instanceof CatalogRepositoryError) throw error;
    throw new CatalogRepositoryError();
  }
}

export async function getCatalogPage(input: CatalogQuery = {}): Promise<CatalogPage> {
  try {
    const { products: allProducts, categories } = await loadMarketCatalog(input.market);
    const selected = input.categories?.length ? input.categories : input.category ? [input.category] : [];
    let products = allProducts.filter((product) => {
      const search = input.search?.trim().toLowerCase();
      if (search && !`${product.name} ${product.description}`.toLowerCase().includes(search)) return false;
      if (selected.length && !selected.includes(product.category) && !selected.includes(categories.find((item) => item.name === product.category)?.slug ?? "")) return false;
      if (Number.isFinite(input.minPrice) && product.price < input.minPrice!) return false;
      if (Number.isFinite(input.maxPrice) && product.price > input.maxPrice!) return false;
      if (Number.isFinite(input.minRating) && product.rating < input.minRating!) return false;
      if (input.inStock && !product.variants.some((variant) => variant.stock > 0)) return false;
      return true;
    });
    const sort = input.sort ?? "featured";
    products.sort((a, b) => sort === "price-asc" ? a.price - b.price
      : sort === "price-desc" ? b.price - a.price
      : sort === "newest" ? b.createdAt.localeCompare(a.createdAt)
      : sort === "rating" ? b.rating - a.rating
      : sort === "name" ? a.name.localeCompare(b.name)
      : sort === "popular" ? b.reviewCount - a.reviewCount
      : Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount);
    const pageSize = Math.min(48, Math.max(1, Math.trunc(input.pageSize ?? 8)));
    const total = products.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const page = Math.min(totalPages, Math.max(1, Math.trunc(input.page ?? 1)));
    products = products.slice((page - 1) * pageSize, page * pageSize);
    return { products, categories: categoriesWithCounts(categories, allProducts), total, page, pageSize, totalPages };
  } catch (error) {
    if (error instanceof CatalogRepositoryError) throw error;
    throw new CatalogRepositoryError();
  }
}

export async function getProductBySlug(slug: string, market?: MarketSlug) {
  const catalog = await loadMarketCatalog(market);
  return catalog.products.find((product) => product.slug === slug) ?? null;
}

export async function getRelatedProducts(product: Product, limit = 4) {
  const page = await getCatalogPage({ category: product.category, pageSize: 48, sort: "featured", market: product.marketSlug as MarketSlug });
  return page.products.filter((item) => item.id !== product.id).slice(0, limit);
}

export async function getFeaturedProducts(limit = 5, market?: MarketSlug) {
  const page = await getCatalogPage({ pageSize: Math.min(48, limit), sort: "featured", market });
  return page.products.slice(0, limit);
}

export function getStaticMarket(slug: MarketSlug) {
  return MARKETS[slug];
}
