import "server-only";

import { headers } from "next/headers";
import { DEFAULT_MARKET, isMarketSlug, MARKETS, type MarketSlug } from "@/lib/markets";

export async function getRequestMarketSlug(): Promise<MarketSlug> {
  const value = (await headers()).get("x-maqbool-market");
  return isMarketSlug(value) ? value : DEFAULT_MARKET;
}

export async function getRequestMarket() {
  return MARKETS[await getRequestMarketSlug()];
}

