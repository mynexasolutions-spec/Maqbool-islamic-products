"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { marketHref, type MarketSlug } from "@/lib/markets";

type SearchDialogProps = {
  open: boolean;
  onClose: () => void;
  marketSlug: MarketSlug;
};

export function SearchDialog({ open, onClose, marketSlug }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => inputRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-forest/95 px-5 py-16 text-white" role="dialog" aria-modal="true" aria-labelledby="product-search-title">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8 flex items-center justify-between gap-6">
          <h2 id="product-search-title" className="font-heading text-3xl">Find something meaningful</h2>
          <button onClick={onClose} className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/30 hover:border-gold hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold" aria-label="Close search">
            <X aria-hidden="true" />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const normalized = query.trim();
            if (!normalized) return;
            const params = new URLSearchParams({ q: normalized });
            window.location.assign(`${marketHref(marketSlug, "/shop")}?${params.toString()}`);
          }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted" aria-hidden="true" />
            <Input
              ref={inputRef}
              name="q"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search Quran, prayer mats, attars…"
              className="h-12 bg-white pl-12 text-base text-[#2b2b2b]"
            />
          </div>
          <button type="submit" disabled={!query.trim()} className="min-h-12 rounded bg-gold px-6 text-sm font-bold text-forest transition hover:bg-[#d0b877] disabled:cursor-not-allowed disabled:opacity-50">
            Search catalog
          </button>
        </form>
        <p className="mt-4 text-sm text-white/75">Searches use the current Maqbool catalog and open matching products in the shop.</p>
      </div>
    </div>
  );
}
