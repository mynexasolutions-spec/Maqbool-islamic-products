"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Globe2, Save } from "lucide-react";
import { saveMarket, saveMarketOffer, type AdminMarket, type MarketOffer } from "@/app/admin/markets/actions";
import { AdminPageHeader, AdminPanel, StatusPill } from "./admin-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export function MarketManager({ initialMarkets, initialOffers }: { initialMarkets: AdminMarket[]; initialOffers: MarketOffer[] }) {
  const router = useRouter();
  const [markets, setMarkets] = useState(initialMarkets);
  const [selectedSlug, setSelectedSlug] = useState(initialMarkets[0]?.slug ?? "in");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const selected = markets.find((market) => market.slug === selectedSlug);

  function updateMarket(next: AdminMarket) {
    setMarkets((current) => current.map((market) => market.id === next.id ? next : market));
  }

  function persistMarket() {
    if (!selected) return;
    setError("");
    startTransition(async () => {
      const result = await saveMarket(selected);
      if (!result.ok) setError(result.error);
      else {
        setMessage(result.message);
        router.refresh();
      }
    });
  }

  return (
    <>
      <AdminPageHeader eyebrow="International commerce" title="Markets & pricing" description="Control local currencies, checkout rules, and variant prices for every selling location." />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Markets">
        {markets.map((market) => (
          <button key={market.id} type="button" role="tab" aria-selected={selectedSlug === market.slug} onClick={() => { setSelectedSlug(market.slug); setError(""); setMessage(""); }} className={`min-h-11 rounded-lg border px-4 text-sm font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c] ${selectedSlug === market.slug ? "border-[#123d32] bg-[#123d32] text-white" : "border-[#d8d2c5] bg-white text-[#35584d]"}`}>
            {market.name} · {market.currencyCode}
          </button>
        ))}
      </div>
      <p className="mb-4 min-h-5 text-sm font-semibold text-[#176342]" role="status" aria-live="polite">{message}</p>
      {error && <p className="mb-4 rounded-lg border border-[#edc8bf] bg-[#fff1ee] p-3 text-sm text-[#8d3426]" role="alert">{error}</p>}

      {selected && (
        <AdminPanel className="mb-7 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3"><Globe2 className="h-5 w-5 text-[#a47a22]" aria-hidden="true" /><h2 className="font-heading text-2xl text-[#123d32]">{selected.name} checkout</h2></div>
              <p className="mt-1 text-sm text-[#65736d]">Entered prices are tax-exclusive; tax is added during checkout.</p>
            </div>
            <StatusPill active={selected.isActive} />
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="Tax label"><Input value={selected.taxLabel} onChange={(event) => updateMarket({ ...selected, taxLabel: event.target.value })} /></Field>
            <Field label="Tax rate (%)"><Input type="number" min="0" max="100" step="0.01" value={selected.taxRate} onChange={(event) => updateMarket({ ...selected, taxRate: Number(event.target.value) })} /></Field>
            <Field label={`Shipping (${selected.currencyCode})`}><Input type="number" min="0" step="0.01" value={selected.shippingFee} onChange={(event) => updateMarket({ ...selected, shippingFee: Number(event.target.value) })} /></Field>
            <Field label="Free shipping threshold"><Input type="number" min="0" step="0.01" value={selected.freeShippingThreshold ?? ""} onChange={(event) => updateMarket({ ...selected, freeShippingThreshold: event.target.value === "" ? null : Number(event.target.value) })} /></Field>
            <Field label={`COD fee (${selected.currencyCode})`}><Input type="number" min="0" step="0.01" value={selected.codFee} onChange={(event) => updateMarket({ ...selected, codFee: Number(event.target.value) })} /></Field>
            <Field label="Delivery estimate"><Input value={selected.deliveryEstimate} onChange={(event) => updateMarket({ ...selected, deliveryEstimate: event.target.value })} /></Field>
          </div>
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
            <Toggle label="Tax shipping" checked={selected.taxAppliesToShipping} onChange={(value) => updateMarket({ ...selected, taxAppliesToShipping: value })} />
            <Toggle label="COD available" checked={selected.codEnabled} onChange={(value) => updateMarket({ ...selected, codEnabled: value })} />
            <Toggle label="Mock online payment" checked={selected.onlineEnabled} onChange={(value) => updateMarket({ ...selected, onlineEnabled: value })} />
            <Toggle label="Configuration complete" checked={selected.configurationComplete} onChange={(value) => updateMarket({ ...selected, configurationComplete: value })} />
            <Toggle label="Market active" checked={selected.isActive} onChange={(value) => updateMarket({ ...selected, isActive: value })} />
          </div>
          <Button onClick={persistMarket} disabled={pending} className="mt-6 min-h-11 bg-[#123d32] hover:bg-[#1a5445]"><Save className="mr-2 h-4 w-4" />{pending ? "Saving…" : "Save checkout settings"}</Button>
        </AdminPanel>
      )}

      {selected && (
        <AdminPanel>
          <div className="border-b border-[#e8e3d8] p-5 sm:p-6">
            <h2 className="font-heading text-2xl text-[#123d32]">{selected.name} variant prices</h2>
            <p className="mt-1 text-sm text-[#65736d]">A missing or inactive price hides that variant in this market. Stock remains global.</p>
          </div>
          <div className="divide-y divide-[#eee9df]">
            {initialOffers.map((offer) => <OfferEditor key={`${selected.id}:${offer.variantId}`} market={selected} offer={offer} onMessage={setMessage} onError={setError} />)}
          </div>
        </AdminPanel>
      )}
    </>
  );
}

function OfferEditor({ market, offer, onMessage, onError }: { market: AdminMarket; offer: MarketOffer; onMessage: (value: string) => void; onError: (value: string) => void }) {
  const initial = offer.prices[market.slug];
  const [price, setPrice] = useState(initial?.price ?? 0);
  const [compareAtPrice, setCompareAtPrice] = useState<number | null>(initial?.compareAtPrice ?? null);
  const [active, setActive] = useState(initial?.isActive ?? false);
  const [pending, startTransition] = useTransition();
  const save = () => {
    onError("");
    startTransition(async () => {
      const result = await saveMarketOffer({ marketId: market.id, variantId: offer.variantId, price, compareAtPrice, isActive: active });
      if (!result.ok) onError(result.error);
      else onMessage(`${offer.productName} · ${offer.variantName} saved for ${market.name}.`);
    });
  };
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-[minmax(220px,1fr)_150px_150px_110px_54px] sm:items-end">
      <div><p className="font-bold text-[#263d35]">{offer.productName}</p><p className="text-xs text-[#74807b]">{offer.variantName} · {offer.sku}</p></div>
      <Field label={`Price (${market.currencyCode})`}><Input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(Number(event.target.value))} /></Field>
      <Field label="Compare-at"><Input type="number" min="0" step="0.01" value={compareAtPrice ?? ""} onChange={(event) => setCompareAtPrice(event.target.value === "" ? null : Number(event.target.value))} /></Field>
      <Toggle label="Available" checked={active} onChange={setActive} />
      <button type="button" onClick={save} disabled={pending} aria-label={`Save ${offer.productName}, ${offer.variantName}`} className="grid min-h-11 min-w-11 place-items-center rounded-lg bg-[#123d32] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c] disabled:opacity-60">{pending ? "…" : <CheckCircle2 className="h-4 w-4" />}</button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-[#52625c]">{label}<span className="mt-1.5 block">{children}</span></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#2a4038]"><Checkbox checked={checked} onChange={(event) => onChange(event.target.checked)} />{label}</label>;
}
