import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageBanner } from "@/components/layout/page-banner";
import { CatalogFilters } from "@/components/catalog/catalog-filters";

export const metadata: Metadata = {
  title: "Shop All Products - Maqbool Islamic Products",
  description: "Browse authentic Islamic essentials, gifts, Quran editions, prayer mats, attars and tasbih.",
};

export default function ShopPage() {
  return (
    <>
      <Header />
      <PageBanner title="Shop All Products" current="Shop" />
      <Suspense fallback={<main className="site-container py-16 text-center text-muted">Preparing the collection…</main>}>
        <CatalogFilters />
      </Suspense>
      <Footer />
    </>
  );
}
