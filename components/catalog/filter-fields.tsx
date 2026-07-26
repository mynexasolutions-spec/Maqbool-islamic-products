"use client";

import { useId } from "react";
import type { Category } from "@/lib/models";
import { useMarket } from "@/components/providers/market-provider";

export type FilterFieldProps = {
  categories: string[];
  availableCategories: Array<Category & { productCount: number }>;
  setCategories: (value: string[]) => void;
  minPrice: string;
  setMinPrice: (value: string) => void;
  maxPrice: string;
  setMaxPrice: (value: string) => void;
  minRating: number;
  setMinRating: (value: number) => void;
  clear: () => void;
};

export function FilterFields(props: FilterFieldProps) {
  const { market } = useMarket();
  const { categories, availableCategories, setCategories, minPrice, setMinPrice, maxPrice, setMaxPrice, minRating, setMinRating, clear } = props;
  const prefix = useId();
  const toggleCategory = (slug: string) =>
    setCategories(categories.includes(slug) ? categories.filter((item) => item !== slug) : [...categories, slug]);

  return (
    <div className="space-y-8">
      <section aria-labelledby={`${prefix}-categories`}>
        <h2 id={`${prefix}-categories`} className="mb-4 border-b border-[#e3dec8] pb-3 font-heading text-xl text-forest">Categories</h2>
        <div className="space-y-1.5">
          {availableCategories.map((category) => (
            <label key={category.id} className="flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded px-2 text-sm hover:bg-cream">
              <span className="flex items-center gap-2.5">
                <input type="checkbox" checked={categories.includes(category.slug)} onChange={() => toggleCategory(category.slug)} className="h-5 w-5 accent-forest" />
                {category.name}
              </span>
              <span className="text-xs text-muted">({category.productCount})</span>
            </label>
          ))}
        </div>
      </section>
      <fieldset>
        <legend className="mb-4 w-full border-b border-[#e3dec8] pb-3 font-heading text-xl text-forest">Price range</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            ["Minimum", minPrice, setMinPrice],
            ["Maximum", maxPrice, setMaxPrice],
          ].map(([label, value, setter]) => (
            <label key={label as string} className="text-xs font-semibold text-muted">
              {label as string}
              <span className="mt-1 flex min-h-11 items-center rounded border border-[#cfc8b6] bg-white px-3 focus-within:ring-2 focus-within:ring-gold">
                {market.currencyCode}
                <input type="number" min="0" inputMode="numeric" value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="w-full bg-transparent px-1 py-2 text-sm text-forest outline-none" />
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 w-full border-b border-[#e3dec8] pb-3 font-heading text-xl text-forest">Customer rating</legend>
        {[4.5, 4, 0].map((rating) => (
          <label key={rating} className="flex min-h-11 cursor-pointer items-center gap-2 rounded px-2 text-sm hover:bg-cream">
            <input type="radio" name={`${prefix}-rating`} checked={minRating === rating} onChange={() => setMinRating(rating)} className="h-5 w-5 accent-forest" />
            <span className="text-[#8a6418]">{rating ? `${rating}★ & up` : "All ratings"}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" onClick={clear} className="min-h-11 w-full rounded border border-forest px-4 text-sm font-semibold text-forest transition hover:bg-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
        Clear all filters
      </button>
    </div>
  );
}
