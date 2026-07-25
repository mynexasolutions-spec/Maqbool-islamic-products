import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ProductDetail } from "@/components/product-detail";
import { ProductCard } from "@/components/product-card";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "The Holy Quran (Gold Embossed Edition) - Maqbool Islamic Products",
};

export default function ProductPage() {
  const related = [products[2], products[6], products[3], products[4]];

  return (
    <>
      <Header />
      <main className="site-container py-8">
        <nav className="mb-8 text-xs text-muted">
          <Link href="/" className="font-medium text-forest">Home</Link>
          {" / "}
          <Link href="/shop" className="font-medium text-forest">Quran &amp; Tafsir</Link>
          {" / "}
          <span>The Holy Quran (Gold Embossed Edition)</span>
        </nav>
        <ProductDetail />
        <section className="py-[60px]">
          <h2 className="section-title">Complete Your Collection</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((product) => (
              <ProductCard key={product.name} product={product} compact />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
