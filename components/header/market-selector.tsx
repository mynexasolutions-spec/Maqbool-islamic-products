"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { MARKETS, type MarketSlug } from "@/lib/markets";

type MarketSelectorProps = {
  value: MarketSlug;
  options: MarketSlug[];
  onChange: (market: MarketSlug) => void;
  className?: string;
};

export function MarketSelector({ value, options, onChange, className = "" }: MarketSelectorProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef(new Map<MarketSlug, HTMLButtonElement>());
  const listboxId = useId();
  const selected = MARKETS[value];

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        rootRef.current?.querySelector<HTMLButtonElement>("[aria-haspopup='listbox']")?.focus();
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  const moveFocus = (direction: 1 | -1) => {
    const currentIndex = options.findIndex((slug) => optionRefs.current.get(slug) === document.activeElement);
    const nextIndex = currentIndex < 0
      ? options.indexOf(value)
      : (currentIndex + direction + options.length) % options.length;
    optionRefs.current.get(options[nextIndex])?.focus();
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-label={`Shopping market: ${selected.name}, ${selected.currencyCode}`}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
          window.requestAnimationFrame(() => optionRefs.current.get(value)?.focus());
        }}
        className="flex min-h-11 w-full items-center gap-2 rounded-md border border-[#d8d0bc] bg-white px-2.5 text-left text-xs font-semibold text-forest shadow-sm transition hover:border-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
      >
        <span className="h-5 w-7 shrink-0 overflow-hidden rounded-[3px] border border-black/10 bg-cream">
          <img src={selected.flagSrc} alt="" className="h-full w-full object-cover" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate">{selected.name}</span>
          <span className="block text-[10px] font-medium tracking-wide text-muted">{selected.currencyCode}</span>
        </span>
        <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
      </button>
      {open && (
        <div
          id={listboxId}
          role="listbox"
          aria-label="Choose shopping market"
          aria-activedescendant={`market-option-${value}`}
          className="absolute right-0 top-[calc(100%+0.4rem)] z-[120] min-w-[15rem] overflow-hidden rounded-xl border border-[#e8ddc8] bg-white p-1.5 shadow-[0_18px_50px_rgba(15,56,44,0.2)]"
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              moveFocus(event.key === "ArrowDown" ? 1 : -1);
            } else if (event.key === "Home" || event.key === "End") {
              event.preventDefault();
              optionRefs.current.get(options[event.key === "Home" ? 0 : options.length - 1])?.focus();
            }
          }}
        >
          {options.map((slug) => {
            const item = MARKETS[slug];
            const isSelected = slug === value;
            return (
              <button
                key={slug}
                id={`market-option-${slug}`}
                ref={(node) => {
                  if (node) optionRefs.current.set(slug, node);
                  else optionRefs.current.delete(slug);
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  setOpen(false);
                  if (!isSelected) onChange(slug);
                }}
                className={`flex min-h-12 w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold ${
                  isSelected ? "bg-cream text-forest" : "text-[#34463f] hover:bg-cream/70"
                }`}
              >
                <span className="h-6 w-9 shrink-0 overflow-hidden rounded border border-black/10 bg-cream">
                  <img src={item.flagSrc} alt="" className="h-full w-full object-cover" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{item.name}</span>
                  <span className="text-xs text-muted">{item.currencyCode}</span>
                </span>
                {isSelected && <Check className="h-4 w-4 text-gold-dark" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
