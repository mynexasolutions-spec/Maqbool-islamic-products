import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageBanner } from "@/components/layout/page-banner";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { parseCatalogSearchParams, type ShopSearchParams } from "@/components/catalog/catalog-search-params";
import { getCatalogPage } from "@/lib/catalog-repository";

export const metadata: Metadata = {
  title: "Shop All Products - Maqbool Islamic Products",
  description: "Browse authentic Islamic essentials, gifts, Quran editions, prayer mats, attars and tasbih.",
};

export default async function ShopPage({ searchParams }: { searchParams: Promise<ShopSearchParams> }) {
  const params = await searchParams;
  const { filters, query } = parseCatalogSearchParams(params);
  const results = await getCatalogPage(query);

  return (
    <>
      <Header />
      <PageBanner title="Shop All Products" current="Shop" />
      <CatalogFilters
        results={results}
        initialFilters={filters}
      />
      <Footer />
    </>
  );
}
