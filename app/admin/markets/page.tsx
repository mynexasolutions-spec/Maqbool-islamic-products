import { MarketManager } from "@/components/admin/market-manager";
import { getAdminMarkets, getMarketOffers } from "./actions";

export default async function AdminMarketsPage() {
  const [markets, offers] = await Promise.all([getAdminMarkets(), getMarketOffers()]);
  return <MarketManager initialMarkets={markets} initialOffers={offers} />;
}
