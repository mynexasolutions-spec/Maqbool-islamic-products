import type { Market } from "@/lib/markets";

const Separator = () => <span className="text-white/45" aria-hidden="true">|</span>;

function MessageGroup({ market, hidden = false }: { market: Market; hidden?: boolean }) {
  return (
    <span className="market-marquee-group" aria-hidden={hidden || undefined}>
      <span>Shopping in {market.name} · {market.currencyCode}</span>
      <Separator />
      <span>Local tax and shipping at checkout</span>
      <Separator />
      <span>Easy 7-Day Returns</span>
    </span>
  );
}

export function InformationMarquee({ market }: { market: Market }) {
  return (
    <aside className="market-marquee" aria-label="Shopping information">
      <div className="market-marquee-track">
        <MessageGroup market={market} />
        <MessageGroup market={market} hidden />
      </div>
    </aside>
  );
}
