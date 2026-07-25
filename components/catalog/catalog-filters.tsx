"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { catalogProducts } from "@/data/catalog-products";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { FilterFields, type FilterFieldProps } from "@/components/catalog/filter-fields";

const PAGE_SIZE = 6;
type SortKey = "popular" | "newest" | "price-asc" | "price-desc" | "rating";

export function CatalogFilters() {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [categories, setCategories] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [sort, setSort] = useState<SortKey>("popular");
  const [page, setPage] = useState(1);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const query = searchParams.get("q");
    if (query !== null) setSearch(query);
  }, [searchParams]);
  useEffect(() => setPage(1), [search, categories, minPrice, maxPrice, minRating, sort]);
  useEffect(() => {
    if (!mobileOpen) return;
    closeButtonRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => event.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  const filtered = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    const minimum = minPrice === "" ? 0 : Number(minPrice);
    const maximum = maxPrice === "" ? Number.POSITIVE_INFINITY : Number(maxPrice);
    return catalogProducts
      .filter((product) => product.active)
      .filter((product) => !query || `${product.name} ${product.category} ${product.description}`.toLocaleLowerCase().includes(query))
      .filter((product) => categories.length === 0 || categories.includes(product.category))
      .filter((product) => product.price >= minimum && product.price <= maximum)
      .filter((product) => product.rating >= minRating)
      .sort((a, b) => {
        if (sort === "newest") return Date.parse(b.createdAt) - Date.parse(a.createdAt);
        if (sort === "price-asc") return a.price - b.price;
        if (sort === "price-desc") return b.price - a.price;
        if (sort === "rating") return b.rating - a.rating;
        return Number(b.featured) - Number(a.featured) || b.reviewCount - a.reviewCount;
      });
  }, [categories, maxPrice, minPrice, minRating, search, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const clear = () => {
    setSearch("");
    setCategories([]);
    setMinPrice("");
    setMaxPrice("");
    setMinRating(0);
  };
  const filterProps: FilterFieldProps = { categories, setCategories, minPrice, setMinPrice, maxPrice, setMaxPrice, minRating, setMinRating, clear };

  return (
    <main id="main-content" className="site-container py-10 sm:py-[50px]">
      <div className="mb-8 rounded-xl border border-[#e7dfcb] bg-cream p-4 sm:p-6">
        <label htmlFor="catalog-search" className="mb-2 block text-xs font-bold uppercase tracking-[.14em] text-gold-dark">Find something meaningful</label>
        <input id="catalog-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search Quran, prayer mats, attar…" className="min-h-12 w-full rounded-md border border-[#cbc1a8] bg-white px-4 text-base text-forest outline-none placeholder:text-muted focus:ring-2 focus:ring-gold" />
      </div>
      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <aside className="hidden lg:block" aria-label="Product filters"><FilterFields {...filterProps} /></aside>
        <section aria-labelledby="catalog-heading">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#eee8d5] pb-4">
            <div>
              <h1 id="catalog-heading" className="font-heading text-2xl text-forest">The Maqbool collection</h1>
              <p className="mt-1 text-sm text-muted" role="status" aria-live="polite">
                {filtered.length === 0 ? "No products found" : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} products`}
              </p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <button type="button" onClick={() => setMobileOpen(true)} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded border border-forest px-3 text-sm font-semibold text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold lg:hidden">
                <SlidersHorizontal className="h-4 w-4" aria-hidden="true" /> Filters
              </button>
              <label className="sr-only" htmlFor="catalog-sort">Sort products</label>
              <select id="catalog-sort" value={sort} onChange={(event) => setSort(event.target.value as SortKey)} className="min-h-11 flex-1 rounded border border-[#cfc8b6] bg-white px-3 text-sm text-forest outline-none focus:ring-2 focus:ring-gold sm:flex-none">
                <option value="popular">Most popular</option><option value="newest">Newest arrivals</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="rating">Highest rated</option>
              </select>
            </div>
          </div>
          {visible.length ? (
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visible.map((product) => <CatalogCard key={product.id} product={product} />)}</div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#cfc5aa] bg-cream px-6 py-16 text-center">
              <p className="font-heading text-2xl text-forest">No matches in this collection</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">Try a broader search or clear your filters to see all of our carefully selected essentials.</p>
              <button type="button" onClick={clear} className="mt-6 min-h-11 rounded bg-forest px-6 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">Show all products</button>
            </div>
          )}
          {totalPages > 1 ? (
            <nav aria-label="Product pages" className="mt-10 flex flex-wrap justify-center gap-2">
              <button type="button" disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="min-h-11 rounded border border-[#d8d0bc] px-4 text-sm font-semibold text-forest disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => <button key={number} type="button" aria-current={safePage === number ? "page" : undefined} aria-label={`Page ${number}`} onClick={() => setPage(number)} className={`min-h-11 min-w-11 rounded border text-sm font-semibold ${safePage === number ? "border-forest bg-forest text-white" : "border-[#d8d0bc] text-forest"}`}>{number}</button>)}
              <button type="button" disabled={safePage === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))} className="min-h-11 rounded border border-[#d8d0bc] px-4 text-sm font-semibold text-forest disabled:cursor-not-allowed disabled:opacity-40">Next</button>
            </nav>
          ) : null}
        </section>
      </div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-labelledby="mobile-filter-title">
          <button type="button" aria-label="Close filters" className="absolute inset-0 bg-black/45" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[min(90vw,390px)] overflow-y-auto bg-white p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between border-b border-[#e3dec8] pb-4">
              <h2 id="mobile-filter-title" className="font-heading text-2xl text-forest">Refine collection</h2>
              <button ref={closeButtonRef} type="button" onClick={() => setMobileOpen(false)} aria-label="Close filters" className="flex h-11 w-11 items-center justify-center rounded-full text-forest focus-visible:ring-2 focus-visible:ring-gold"><X aria-hidden="true" /></button>
            </div>
            <FilterFields {...filterProps} />
            <button type="button" onClick={() => setMobileOpen(false)} className="mt-4 min-h-12 w-full rounded bg-forest px-5 text-sm font-semibold text-white">View {filtered.length} products</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
