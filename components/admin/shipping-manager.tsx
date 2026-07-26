"use client";

import { useState, useTransition } from "react";
import { Save, Truck } from "lucide-react";
import { saveMarket, type AdminMarket } from "@/app/admin/markets/actions";
import { AdminPageHeader, AdminPanel, StatusPill } from "./admin-ui";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export function ShippingManager({ initialMarkets }: { initialMarkets: AdminMarket[] }) {
  const [markets, setMarkets] = useState(initialMarkets);
  const [selectedId, setSelectedId] = useState(initialMarkets[0]?.id ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const selected = markets.find((market) => market.id === selectedId);

  function update(next: AdminMarket) {
    setMarkets((current) => current.map((market) => market.id === next.id ? next : market));
  }

  function save() {
    if (!selected) return;
    setError("");
    startTransition(async () => {
      const result = await saveMarket(selected);
      if (!result.ok) setError(result.error);
      else setMessage(`${selected.name} shipping settings saved.`);
    });
  }

  return (
    <>
      <AdminPageHeader eyebrow="Fulfilment" title="Shipping" description="Set delivery charges, free-shipping thresholds, COD fees, and estimates separately for each market." />
      <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Shipping markets">
        {markets.map((market) => (
          <button key={market.id} type="button" role="tab" aria-selected={selectedId === market.id} onClick={() => { setSelectedId(market.id); setMessage(""); setError(""); }} className={`min-h-11 rounded-lg border px-4 text-sm font-bold ${selectedId === market.id ? "border-[#123d32] bg-[#123d32] text-white" : "border-[#d8d2c5] bg-white text-[#35584d]"}`}>
            {market.name} · {market.currencyCode}
          </button>
        ))}
      </div>
      <p className="mb-4 min-h-5 text-sm font-semibold text-[#176342]" role="status">{message}</p>
      {error && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      {selected && (
        <AdminPanel className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#eee9dc] text-[#86651f]"><Truck className="h-5 w-5" /></span><div><h2 className="font-heading text-2xl text-[#123d32]">{selected.name}</h2><p className="mt-1 text-sm text-[#65736d]">All amounts use {selected.currencyCode}.</p></div></div>
            <StatusPill active={selected.isActive} label={selected.isActive ? "Market active" : "Market inactive"} />
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <Field label={`Standard shipping (${selected.currencyCode})`}><Input type="number" min="0" step="0.01" value={selected.shippingFee} onChange={(event) => update({ ...selected, shippingFee: Number(event.target.value) })} /></Field>
            <Field label={`Free shipping from (${selected.currencyCode})`}><Input type="number" min="0" step="0.01" value={selected.freeShippingThreshold ?? ""} onChange={(event) => update({ ...selected, freeShippingThreshold: event.target.value === "" ? null : Number(event.target.value) })} placeholder="No threshold" /></Field>
            <Field label={`COD handling fee (${selected.currencyCode})`}><Input type="number" min="0" step="0.01" value={selected.codFee} onChange={(event) => update({ ...selected, codFee: Number(event.target.value) })} /></Field>
            <Field label="Delivery estimate"><Input value={selected.deliveryEstimate} onChange={(event) => update({ ...selected, deliveryEstimate: event.target.value })} /></Field>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2">
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[#2a4038]"><Checkbox checked={selected.codEnabled} onChange={(event) => update({ ...selected, codEnabled: event.target.checked })} />Cash on delivery available</label>
            <label className="flex min-h-11 items-center gap-3 text-sm font-semibold text-[#2a4038]"><Checkbox checked={selected.onlineEnabled} onChange={(event) => update({ ...selected, onlineEnabled: event.target.checked })} />Online payment available</label>
          </div>
          <Button type="button" onClick={save} disabled={pending} className="mt-7 min-h-11 bg-[#123d32] hover:bg-[#1a5445]"><Save className="mr-2 h-4 w-4" />{pending ? "Saving…" : "Save shipping settings"}</Button>
        </AdminPanel>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-xs font-bold text-[#52625c]">{label}<span className="mt-2 block">{children}</span></label>;
}
