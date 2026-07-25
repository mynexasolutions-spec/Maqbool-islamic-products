"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search, ShoppingBag, UserRound } from "lucide-react";

const navigation = [
  ["Home", "/"],
  ["Shop", "/shop"],
  ["Categories", "#categories"],
  ["Best Sellers", "#best-sellers"],
  ["Contact Us", "/contact"],
  ["About Us", "/about"],
  ["Reviews", "#reviews"],
  ["FAQs", "#faqs"],
] as const;

function Brand() {
  return (
    <Link href="/" className="flex min-w-fit items-center gap-2.5">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-10 w-10 fill-forest"
      >
        <path d="M12 2 2 22h20L12 2Zm0 3.99L19.53 19H4.47L12 5.99Z" />
      </svg>
      <span>
        <span className="block font-heading text-[1.4rem] leading-none tracking-[1.5px] text-forest">
          MAQBOOL ISLAMIC PRODUCTS
        </span>
        <span className="mt-1 block text-[0.65rem] uppercase tracking-[1px] text-gold">
          Purify Your Deen. Enrich Your Life.
        </span>
      </span>
    </Link>
  );
}

export function Header() {
  const pathname = usePathname();

  return (
    <>
      <div className="bg-forest py-2 text-center text-xs font-medium tracking-[0.5px] text-white">
        <div className="site-container flex flex-wrap justify-center gap-x-[30px] gap-y-1">
          <span>FREE SHIPPING on orders above ₹999</span>
          <span>|</span>
          <span>COD Available</span>
          <span>|</span>
          <span>Easy 7-Day Returns</span>
        </div>
      </div>
      <header className="sticky top-0 z-50 border-b border-[#eee8d5] bg-white">
        <div className="site-container flex min-h-[72px] items-center justify-between gap-5">
          <Brand />
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-6 xl:flex"
          >
            {navigation.map(([label, href]) => {
              const active =
                href === "/" ? pathname === "/" : href.startsWith("/") && pathname === href;
              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-gold ${
                    active ? "text-gold" : "text-[#2b2b2b]"
                  }`}
                >
                  {label}
                  {label === "Categories" && <ChevronDown className="h-3 w-3" />}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-5">
            <button aria-label="Search" className="transition-colors hover:text-gold">
              <Search className="h-[18px] w-[18px]" />
            </button>
            <button aria-label="Account" className="transition-colors hover:text-gold">
              <UserRound className="h-[18px] w-[18px]" />
            </button>
            <button
              aria-label="Shopping bag with 2 items"
              className="relative transition-colors hover:text-gold"
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              <span className="absolute -right-2.5 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[0.65rem] text-white">
                2
              </span>
            </button>
          </div>
        </div>
        <nav
          aria-label="Mobile navigation"
          className="site-container flex gap-5 overflow-x-auto border-t border-[#f4f0e5] py-2 xl:hidden"
        >
          {navigation.map(([label, href]) => (
            <Link key={label} href={href} className="min-w-fit text-xs font-medium">
              {label}
            </Link>
          ))}
        </nav>
      </header>
    </>
  );
}
