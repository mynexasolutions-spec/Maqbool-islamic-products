export const MARKET_SLUGS = ["in", "sa", "dubai", "my", "qa"] as const;
export type MarketSlug = (typeof MARKET_SLUGS)[number];

export type Market = {
  code: string;
  slug: MarketSlug;
  name: string;
  countryCode: string;
  currencyCode: string;
  locale: string;
  flagSrc: string;
};

export const MARKETS: Record<MarketSlug, Market> = {
  in: { code: "IN", slug: "in", name: "India", countryCode: "IN", currencyCode: "INR", locale: "en-IN", flagSrc: "/flags/india.png" },
  sa: { code: "SA", slug: "sa", name: "Saudi Arabia", countryCode: "SA", currencyCode: "SAR", locale: "en-SA", flagSrc: "/flags/saudi-arabia.png" },
  dubai: { code: "AE-DXB", slug: "dubai", name: "Dubai", countryCode: "AE", currencyCode: "AED", locale: "en-AE", flagSrc: "/flags/united-arab-emirates.png" },
  my: { code: "MY", slug: "my", name: "Malaysia", countryCode: "MY", currencyCode: "MYR", locale: "en-MY", flagSrc: "/flags/malaysia.png" },
  qa: { code: "QA", slug: "qa", name: "Qatar", countryCode: "QA", currencyCode: "QAR", locale: "en-QA", flagSrc: "/flags/qatar.png" },
};

export const DEFAULT_MARKET: MarketSlug = "in";
export const MARKET_COOKIE = "maqbool_market";

export function isMarketSlug(value: string | null | undefined): value is MarketSlug {
  return !!value && MARKET_SLUGS.includes(value as MarketSlug);
}

export function stripMarketPrefix(pathname: string) {
  const parts = pathname.split("/");
  return isMarketSlug(parts[1]) ? `/${parts.slice(2).join("/")}`.replace(/\/$/, "") || "/" : pathname;
}

export function marketHref(market: MarketSlug, href: string) {
  if (!href.startsWith("/") || href.startsWith("/admin") || href.startsWith("/api")) return href;
  const clean = stripMarketPrefix(href);
  return clean === "/" ? `/${market}` : `/${market}${clean}`;
}

export function formatMoney(value: number, market: Market | MarketSlug = DEFAULT_MARKET) {
  const selected = typeof market === "string" ? MARKETS[market] : market;
  return new Intl.NumberFormat(selected.locale, {
    style: "currency",
    currency: selected.currencyCode,
    minimumFractionDigits: selected.slug === "in" ? 0 : 2,
    maximumFractionDigits: selected.slug === "in" ? 0 : 2,
  }).format(value);
}
