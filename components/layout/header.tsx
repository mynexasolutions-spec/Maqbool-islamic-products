"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/providers/cart-provider";
import { useCustomer } from "@/components/providers/customer-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { useMarket } from "@/components/providers/market-provider";
import { MARKET_COOKIE, MARKETS, marketHref, stripMarketPrefix, type MarketSlug } from "@/lib/markets";

const navigation = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Categories", "/shop"],
  ["Contact", "/contact"],
  ["About", "/about"],
] as const;

function Brand({ marketSlug }: { marketSlug: MarketSlug }) {
  return (
    <Link href={marketHref(marketSlug, "/")} className="flex min-w-fit items-center gap-2.5" aria-label="Maqbool Islamic Products home">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-9 w-9 fill-forest sm:h-10 sm:w-10">
        <path d="M12 2 2 22h20L12 2Zm0 3.99L19.53 19H4.47L12 5.99Z" />
      </svg>
      <span>
        <span className="block font-heading text-base leading-none tracking-[1.2px] text-forest sm:text-[1.4rem]">
          MAQBOOL <span className="hidden sm:inline">ISLAMIC PRODUCTS</span>
        </span>
        <span className="mt-1 hidden text-[0.65rem] uppercase tracking-[1px] text-gold sm:block">
          Purify Your Deen. Enrich Your Life.
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();
  const { count, setOpen, clear } = useCart();
  const { marketSlug, market, availableMarketSlugs } = useMarket();
  const { customer, logout } = useCustomer();
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [announcement, setAnnouncement] = useState("");
  const [categories, setCategories] = useState<Array<{ name: string; slug: string }>>([]);
  useEffect(() => {
    fetch("/api/announcement").then((response) => response.json()).then((data) => setAnnouncement(typeof data.message === "string" ? data.message : "")).catch(() => undefined);
    fetch("/api/categories").then((response) => response.json()).then((data) => setCategories(Array.isArray(data.categories) ? data.categories : [])).catch(() => undefined);
  }, []);
  const changeMarket = (next: MarketSlug) => {
    if (next === marketSlug) return;
    if (count > 0 && !window.confirm("Changing your market will clear your shopping bag. Continue?")) return;
    clear();
    document.cookie = `${MARKET_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    window.location.assign(marketHref(next, stripMarketPrefix(pathname)));
  };
  return (
    <>
      {announcement && <aside className="bg-[#d5b56d] px-4 py-2 text-center text-xs font-bold text-[#123d32]" aria-label="Store announcement">{announcement}</aside>}
      <div className="bg-forest py-2 text-center text-xs font-medium tracking-[0.5px] text-white">
        <div className="site-container flex flex-wrap justify-center gap-x-3 gap-y-1 sm:gap-x-[30px]">
          <span>Shopping in {market.name} · {market.currencyCode}</span><span aria-hidden="true">|</span>
          <span>Local tax and shipping at checkout</span><span aria-hidden="true">|</span><span>Easy 7-Day Returns</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-[#eee8d5] bg-white/95 backdrop-blur">
        <div className="site-container flex min-h-[72px] items-center justify-between gap-3">
          <Brand marketSlug={marketSlug} />
          <nav aria-label="Main navigation" className="hidden items-center gap-4 xl:flex 2xl:gap-6">
            {navigation.map(([label, href]) => {
              const localPath = stripMarketPrefix(pathname);
              const active = href === "/" ? localPath === "/" : href.startsWith("/") && localPath === href;
              if (label === "Categories") {
                return (
                  <div key={label} className="relative">
                    <button
                      type="button"
                      aria-expanded={categoryOpen}
                      aria-haspopup="menu"
                      onClick={() => setCategoryOpen((open) => !open)}
                      className={`flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-sm text-[13px] font-medium transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 2xl:text-sm ${categoryOpen ? "text-gold" : "text-[#2b2b2b]"}`}
                    >
                      Categories <ChevronDown className={`h-3 w-3 transition-transform ${categoryOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                    </button>
                    {categoryOpen && (
                      <div role="menu" className="absolute left-1/2 top-8 z-50 w-64 -translate-x-1/2 rounded-lg border border-[#e8ddc8] bg-white p-2 shadow-xl">
                        <Link role="menuitem" href={marketHref(marketSlug, "/shop")} onClick={() => setCategoryOpen(false)} className="block rounded-md px-3 py-2 text-sm font-semibold text-forest hover:bg-cream">
                          View all categories
                        </Link>
                        {categories.map((category) => (
                          <Link
                            key={category.slug}
                            role="menuitem"
                            href={marketHref(marketSlug, `/shop?category=${encodeURIComponent(category.slug)}`)}
                            onClick={() => setCategoryOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm text-[#3d4b46] hover:bg-cream hover:text-forest"
                          >
                            {category.name}
                          </Link>
                        ))}
                        {!categories.length && <p className="px-3 py-2 text-xs text-muted">No active categories.</p>}
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <Link key={label} href={marketHref(marketSlug, href)} className={`flex min-h-11 shrink-0 items-center gap-1 whitespace-nowrap rounded-sm text-[13px] font-medium transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 2xl:text-sm ${active ? "text-gold" : "text-[#2b2b2b]"}`}>
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-1 sm:gap-3">
            <label className="hidden text-xs font-semibold text-forest sm:block">
              <span className="sr-only">Shopping market</span>
              <select
                value={marketSlug}
                onChange={(event) => changeMarket(event.target.value as MarketSlug)}
                className="min-h-11 rounded-md border border-[#d8d0bc] bg-white px-2 text-xs font-semibold text-forest outline-none focus:ring-2 focus:ring-gold"
                aria-label="Shopping market"
              >
                {availableMarketSlugs.map((slug) => <option key={slug} value={slug}>{MARKETS[slug].name} ({MARKETS[slug].currencyCode})</option>)}
              </select>
            </label>
            <button aria-label="Search products" onClick={() => setSearchOpen(true)} className="grid h-11 w-11 place-items-center rounded transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><Search className="h-[18px] w-[18px]" /></button>
            <div className="relative">
              <button aria-label="Account menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><UserRound className="h-[18px] w-[18px]" /></button>
              {accountOpen && (
                <div className="absolute right-0 top-12 w-52 rounded-lg border bg-white p-2 text-sm shadow-xl">
                  {customer ? (
                    <>
                      <p className="px-3 py-2 text-xs text-muted">Assalamu alaikum, <strong className="block text-sm text-forest">{customer.name}</strong></p>
                      <Link href={marketHref(marketSlug, "/profile")} className="block rounded px-3 py-2 hover:bg-cream" onClick={() => setAccountOpen(false)}>My profile</Link>
                      <Link href={marketHref(marketSlug, "/profile/orders")} className="block rounded px-3 py-2 hover:bg-cream" onClick={() => setAccountOpen(false)}>My orders</Link>
                      <button onClick={() => { logout(); setAccountOpen(false); }} className="w-full rounded px-3 py-2 text-left text-[#a53d3d] hover:bg-cream">Log out</button>
                    </>
                  ) : <Link href={marketHref(marketSlug, "/login")} className="block rounded px-3 py-2 hover:bg-cream" onClick={() => setAccountOpen(false)}>Sign in with phone</Link>}
                </div>
              )}
            </div>
            <button aria-label={`Shopping bag with ${count} items`} onClick={() => setOpen(true)} className="relative grid h-11 w-11 place-items-center rounded transition-colors hover:text-gold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] text-white">{count}</span>}
            </button>
            <button aria-label="Toggle navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="grid h-11 w-11 place-items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold xl:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="site-container grid grid-cols-2 gap-1 border-t py-3 xl:hidden">
            <label className="col-span-2 px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted">Shopping market
              <select value={marketSlug} onChange={(event) => changeMarket(event.target.value as MarketSlug)} className="mt-2 min-h-11 w-full rounded border border-[#d8d0bc] bg-white px-3 text-sm text-forest">
                {availableMarketSlugs.map((slug) => <option key={slug} value={slug}>{MARKETS[slug].name} ({MARKETS[slug].currencyCode})</option>)}
              </select>
            </label>
            {navigation.map(([label, href]) => label === "Categories" ? (
              <div key={label} className="col-span-2">
                <button type="button" aria-expanded={categoryOpen} onClick={() => setCategoryOpen((open) => !open)} className="flex min-h-11 w-full items-center justify-between rounded px-3 py-2 text-left text-sm font-medium hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  Categories <ChevronDown className={`h-4 w-4 transition-transform ${categoryOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {categoryOpen && <div className="grid grid-cols-2 gap-1 rounded-lg bg-cream p-2">
                  <Link href={marketHref(marketSlug, "/shop")} onClick={() => { setCategoryOpen(false); setMobileOpen(false); }} className="rounded px-3 py-2 text-sm font-semibold text-forest">View all</Link>
                  {categories.map((category) => <Link key={category.slug} href={marketHref(marketSlug, `/shop?category=${encodeURIComponent(category.slug)}`)} onClick={() => { setCategoryOpen(false); setMobileOpen(false); }} className="rounded px-3 py-2 text-sm hover:bg-white">{category.name}</Link>)}
                </div>}
              </div>
            ) : <Link key={label} href={marketHref(marketSlug, href)} onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm font-medium hover:bg-cream">{label}</Link>)}
          </nav>
        )}
      </header>

      {searchOpen && (
        <div className="fixed inset-0 z-[100] bg-forest/95 px-5 py-16 text-white" role="dialog" aria-modal="true" aria-label="Search products">
          <div className="mx-auto max-w-2xl">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="font-heading text-3xl">Find something meaningful</h2>
              <button onClick={() => setSearchOpen(false)} aria-label="Close search"><X /></button>
            </div>
            <form action={marketHref(marketSlug, "/shop")} method="get" onSubmit={() => setSearchOpen(false)} className="flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted" aria-hidden="true" />
                <Input name="q" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Quran, prayer mats, attars…" className="h-12 bg-white pl-12 text-base text-[#2b2b2b]" />
              </div>
              <button type="submit" disabled={!query.trim()} className="min-h-12 rounded bg-gold px-6 text-sm font-bold text-forest disabled:cursor-not-allowed disabled:opacity-50">
                Search catalog
              </button>
            </form>
            <p className="mt-4 text-sm text-white/75">Searches use the current Maqbool catalog and open matching products in the shop.</p>
          </div>
        </div>
      )}

      <CartDrawer />
    </>
  );
}
