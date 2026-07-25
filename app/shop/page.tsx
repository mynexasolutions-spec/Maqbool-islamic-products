import type { Metadata } from "next";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageBanner } from "@/components/layout/page-banner";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Shop All Products - Maqbool Islamic Products",
};

const categories = [
  ["Quran & Tafsir", "24"],
  ["Prayer Mats", "18"],
  ["Ittars & Perfumes", "32"],
  ["Tasbih & Misbaha", "15"],
  ["Islamic Gifts", "29"],
];

export default function ShopPage() {
  return (
    <>
      <Header />
      <PageBanner title="Shop All Products" current="Shop" />
      <main className="site-container grid gap-10 py-[50px] lg:grid-cols-[240px_1fr]">
        <aside className="space-y-8">
          <section>
            <h2 className="mb-4 border-b border-[#e3dec8] pb-3 font-heading text-xl text-forest">
              Categories
            </h2>
            <ul className="space-y-3">
              {categories.map(([name, count]) => (
                <li key={name} className="flex justify-between text-sm text-muted">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" className="accent-forest" />
                    {name}
                  </label>
                  <span>({count})</span>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2 className="mb-4 border-b border-[#e3dec8] pb-3 font-heading text-xl text-forest">
              Price Range
            </h2>
            <div className="flex items-center gap-2">
              <Input aria-label="Minimum price" placeholder="₹0" />
              <span>-</span>
              <Input aria-label="Maximum price" placeholder="₹2000" />
            </div>
            <button className="mt-3 w-full rounded bg-forest py-2.5 text-xs font-semibold text-white">
              Apply Filter
            </button>
          </section>
          <section>
            <h2 className="mb-4 border-b border-[#e3dec8] pb-3 font-heading text-xl text-forest">
              Rating
            </h2>
            <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="rating" className="accent-forest" />
              <span className="text-[#e0aa3e]">★ ★ ★ ★ ★</span>
              <span className="text-muted">(45)</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="radio" name="rating" className="accent-forest" />
              <span className="text-[#e0aa3e]">★ ★ ★ ★ ☆</span>
              <span className="text-muted">&amp; Up (82)</span>
            </label>
          </section>
        </aside>

        <section>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#eee8d5] pb-4">
            <p className="text-sm text-muted">Showing 1–8 of 118 products</p>
            <label className="flex items-center gap-2 text-sm font-medium">
              Sort by:
              <select className="rounded border border-[#d1cbbd] bg-white px-3 py-2 text-sm outline-none">
                <option>Most Popular</option>
                <option>Newest Arrivals</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.name} product={product} />
            ))}
          </div>
          <nav aria-label="Pagination" className="mt-10 flex justify-center gap-2">
            {[1, 2, 3].map((page) => (
              <button
                key={page}
                className={`flex h-9 w-9 items-center justify-center rounded border text-sm ${
                  page === 1
                    ? "border-forest bg-forest text-white"
                    : "border-[#e3dec8] bg-white text-forest"
                }`}
              >
                {page}
              </button>
            ))}
          </nav>
        </section>
      </main>
      <Footer />
    </>
  );
}
