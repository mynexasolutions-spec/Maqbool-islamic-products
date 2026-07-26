"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_MARKET, isMarketSlug, MARKETS, marketHref, stripMarketPrefix, type MarketSlug } from "@/lib/markets";

type MarketContextValue = {
  marketSlug: MarketSlug;
  market: (typeof MARKETS)[MarketSlug];
  availableMarketSlugs: MarketSlug[];
  checkoutSettings: MarketCheckoutSettings | null;
};

export type MarketCheckoutSettings = {
  taxLabel: string;
  taxRate: number;
  taxAppliesToShipping: boolean;
  shippingFee: number;
  freeShippingThreshold: number | null;
  codFee: number;
  codEnabled: boolean;
  onlineEnabled: boolean;
  deliveryEstimate: string;
};

const MarketContext = createContext<MarketContextValue | null>(null);

export function MarketProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const firstSegment = pathname.split("/")[1];
  const marketSlug = isMarketSlug(firstSegment) ? firstSegment : DEFAULT_MARKET;
  const [availableMarketSlugs, setAvailableMarketSlugs] = useState<MarketSlug[]>([marketSlug]);
  const [checkoutSettings, setCheckoutSettings] = useState<MarketCheckoutSettings | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/markets")
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((data: { markets: Array<{ slug: string; settings: MarketCheckoutSettings }> }) => {
        if (!active) return;
        const slugs = data.markets.map((item) => item.slug).filter(isMarketSlug);
        setAvailableMarketSlugs(slugs.length ? slugs : [marketSlug]);
        if (slugs.length && !slugs.includes(marketSlug)) {
          window.location.replace(marketHref(slugs.includes(DEFAULT_MARKET) ? DEFAULT_MARKET : slugs[0], stripMarketPrefix(window.location.pathname)));
          return;
        }
        setCheckoutSettings(data.markets.find((item) => item.slug === marketSlug)?.settings ?? null);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [marketSlug]);
  const value = useMemo(
    () => ({ marketSlug, market: MARKETS[marketSlug], availableMarketSlugs, checkoutSettings }),
    [availableMarketSlugs, checkoutSettings, marketSlug],
  );
  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const value = useContext(MarketContext);
  if (!value) throw new Error("useMarket must be used within MarketProvider");
  return value;
}
