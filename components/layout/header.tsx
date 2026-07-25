"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";
import { ChevronDown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCart } from "@/components/providers/cart-provider";
import { useCustomer } from "@/components/providers/customer-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { catalogProducts } from "@/data/catalog-products";

const navigation = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Categories", "/shop"],
  ["Best Sellers", "/#best-sellers"],
  ["Contact Us", "/contact"],
  ["About Us", "/about"],
  ["Reviews", "/#reviews"],
  ["FAQs", "/#faqs"],
] as const;

function Brand() {
  return (
    <Link href="/" className="flex min-w-fit items-center gap-2.5" aria-label="Maqbool Islamic Products home">
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
  const { count, setOpen } = useCart();
  const { customer, logout } = useCustomer();
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return catalogProducts.filter((product) =>
      `${product.name} ${product.category}`.toLowerCase().includes(normalized)).slice(0, 6);
  }, [query]);

  return (
    <>
      <div className="bg-forest py-2 text-center text-xs font-medium tracking-[0.5px] text-white">
        <div className="site-container flex flex-wrap justify-center gap-x-3 gap-y-1 sm:gap-x-[30px]">
          <span>FREE SHIPPING on orders above ₹999</span><span aria-hidden="true">|</span>
          <span>COD Available</span><span aria-hidden="true">|</span><span>Easy 7-Day Returns</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-[#eee8d5] bg-white/95 backdrop-blur">
        <div className="site-container flex min-h-[72px] items-center justify-between gap-4">
          <Brand />
          <nav aria-label="Main navigation" className="hidden items-center gap-6 xl:flex">
            {navigation.map(([label, href]) => {
              const active = href === "/" ? pathname === "/" : href.startsWith("/") && pathname === href;
              return (
                <Link key={label} href={href} className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-gold ${active ? "text-gold" : "text-[#2b2b2b]"}`}>
                  {label}{label === "Categories" && <ChevronDown className="h-3 w-3" />}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 sm:gap-5">
            <button aria-label="Search products" onClick={() => setSearchOpen(true)} className="transition-colors hover:text-gold"><Search className="h-[18px] w-[18px]" /></button>
            <div className="relative">
              <button aria-label="Account menu" aria-expanded={accountOpen} onClick={() => setAccountOpen((open) => !open)} className="transition-colors hover:text-gold"><UserRound className="h-[18px] w-[18px]" /></button>
              {accountOpen && (
                <div className="absolute right-0 top-8 w-52 rounded-lg border bg-white p-2 text-sm shadow-xl">
                  {customer ? (
                    <>
                      <p className="px-3 py-2 text-xs text-muted">Assalamu alaikum, <strong className="block text-sm text-forest">{customer.name}</strong></p>
                      <Link href="/profile" className="block rounded px-3 py-2 hover:bg-cream" onClick={() => setAccountOpen(false)}>My profile</Link>
                      <Link href="/profile/orders" className="block rounded px-3 py-2 hover:bg-cream" onClick={() => setAccountOpen(false)}>My orders</Link>
                      <button onClick={() => { logout(); setAccountOpen(false); }} className="w-full rounded px-3 py-2 text-left text-[#a53d3d] hover:bg-cream">Log out</button>
                    </>
                  ) : <Link href="/login" className="block rounded px-3 py-2 hover:bg-cream" onClick={() => setAccountOpen(false)}>Sign in with phone</Link>}
                </div>
              )}
            </div>
            <button aria-label={`Shopping bag with ${count} items`} onClick={() => setOpen(true)} className="relative transition-colors hover:text-gold">
              <ShoppingBag className="h-[18px] w-[18px]" />
              {count > 0 && <span className="absolute -right-2.5 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[0.65rem] text-white">{count}</span>}
            </button>
            <button aria-label="Toggle navigation" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)} className="xl:hidden">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav aria-label="Mobile navigation" className="site-container grid grid-cols-2 gap-1 border-t py-3 xl:hidden">
            {navigation.map(([label, href]) => <Link key={label} href={href} onClick={() => setMobileOpen(false)} className="rounded px-3 py-2 text-sm font-medium hover:bg-cream">{label}</Link>)}
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
            <div className="relative">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted" />
              <Input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Quran, prayer mats, attars…" className="h-12 bg-white pl-12 text-base text-[#2b2b2b]" />
            </div>
            <div className="mt-4 overflow-hidden rounded-lg bg-white text-[#2b2b2b]">
              {query && results.length === 0 && <p className="p-5 text-sm text-muted">No products match “{query}”.</p>}
              {results.map((product) => (
                <Link key={product.name} href={`/shop/${product.slug}`} onClick={() => { setSearchOpen(false); setQuery(""); }} className="flex items-center gap-4 border-b p-4 last:border-0 hover:bg-cream">
                  <Image src={product.images[0]?.src || "/quran.webp"} alt="" width={48} height={48} className="h-12 w-12 rounded object-cover" />
                  <span><strong className="block text-sm text-forest">{product.name}</strong><span className="text-xs text-muted">{product.category}</span></span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <CartDrawer />
    </>
  );
}
