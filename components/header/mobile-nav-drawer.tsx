"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type RefObject } from "react";
import { ChevronDown, X } from "lucide-react";
import { MarketSelector } from "@/components/header/market-selector";
import { marketHref, type MarketSlug } from "@/lib/markets";

type MobileNavDrawerProps = {
  open: boolean;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
  marketSlug: MarketSlug;
  availableMarketSlugs: MarketSlug[];
  onMarketChange: (market: MarketSlug) => void;
  categories: Array<{ name: string; slug: string }>;
};

const mobileNavigation = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Contact", "/contact"],
  ["About", "/about"],
] as const;

export function MobileNavDrawer({
  open,
  onClose,
  triggerRef,
  marketSlug,
  availableMarketSlugs,
  onMarketChange,
  categories,
}: MobileNavDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const titleId = useId();
  const categoriesId = useId();

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("button, a")?.focus());

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])",
      )).filter((element) => element.getClientRects().length > 0);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      triggerRef.current?.focus();
    };
  }, [onClose, open, triggerRef]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[110] xl:hidden">
      <button
        type="button"
        aria-label="Close navigation"
        className="absolute inset-0 cursor-default bg-forest/45 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute inset-y-0 right-0 flex w-[min(88vw,24rem)] flex-col overflow-y-auto border-l border-[#e8ddc8] bg-white shadow-[-20px_0_70px_rgba(15,56,44,0.22)]"
      >
        <div className="flex min-h-[72px] items-center justify-between border-b border-[#eee8d5] px-5">
          <div>
            <p id={titleId} className="font-heading text-xl text-forest">Explore Maqbool</p>
            <p className="mt-0.5 text-[11px] uppercase tracking-[0.12em] text-gold-dark">Purify your deen</p>
          </div>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="grid h-11 w-11 place-items-center rounded-full border border-[#e8ddc8] text-forest transition hover:border-gold hover:text-gold-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <nav aria-label="Mobile navigation" className="flex-1 px-5 py-5">
          <div className="mb-6">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.13em] text-muted">Shopping market</p>
            <MarketSelector
              value={marketSlug}
              options={availableMarketSlugs}
              onChange={onMarketChange}
              className="w-full"
            />
          </div>
          <div className="border-y border-[#eee8d5] py-2">
            {mobileNavigation.map(([label, href]) => (
              <Link
                key={label}
                href={marketHref(marketSlug, href)}
                onClick={onClose}
                className="flex min-h-12 items-center border-b border-[#eee8d5] px-1 font-heading text-[1.08rem] text-forest transition last:border-0 hover:pl-3 hover:text-gold-dark focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                {label}
              </Link>
            ))}
          </div>
          <div className="mt-2 border-b border-[#eee8d5] pb-2">
            <button
              type="button"
              aria-expanded={categoriesOpen}
              aria-controls={categoriesId}
              onClick={() => setCategoriesOpen((current) => !current)}
              className="flex min-h-12 w-full items-center justify-between px-1 text-left font-heading text-[1.08rem] text-forest transition hover:text-gold-dark focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
            >
              Categories
              <ChevronDown className={`h-4 w-4 transition-transform ${categoriesOpen ? "rotate-180" : ""}`} aria-hidden="true" />
            </button>
            <div id={categoriesId} hidden={!categoriesOpen} className="border-l border-gold/50 pl-3">
              <Link
                href={marketHref(marketSlug, "/shop")}
                onClick={onClose}
                className="flex min-h-11 items-center rounded px-2 text-sm font-semibold text-forest hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
              >
                View all categories
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={marketHref(marketSlug, `/shop?category=${encodeURIComponent(category.slug)}`)}
                  onClick={onClose}
                  className="flex min-h-11 items-center rounded px-2 text-sm text-[#3d4b46] hover:bg-cream hover:text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                >
                  {category.name}
                </Link>
              ))}
              {!categories.length && <p className="px-2 py-3 text-xs text-muted">No active categories.</p>}
            </div>
          </div>
        </nav>
        <p className="px-5 pb-6 text-xs leading-relaxed text-muted">Thoughtfully selected essentials for worship and everyday life.</p>
      </aside>
    </div>
  );
}
