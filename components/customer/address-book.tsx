"use client";

import { FormEvent, useState } from "react";
import { MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useCustomer } from "@/components/providers/customer-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Address } from "@/lib/models";

const emptyAddress: Address = { id: "", label: "Home", name: "", phone: "", line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false };

export function AddressBook() {
  const { addresses, saveAddress, removeAddress } = useCustomer();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Address | null>(null);
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    if (!editing.name.trim() || !editing.line1.trim() || !editing.city.trim() || !editing.state.trim()) {
      setError("Complete all required address fields.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(editing.phone) || !/^\d{6}$/.test(editing.pincode)) {
      setError("Enter a valid 10-digit phone number and 6-digit pincode.");
      return;
    }
    saveAddress({ ...editing, id: editing.id || `addr-${Date.now()}` });
    toast(editing.id ? "Address updated." : "Address saved.");
    setEditing(null);
    setError("");
  }

  return (
    <section id="addresses" className="mt-8 scroll-mt-28 rounded-xl border border-[#e8ddc8] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.18em] text-gold">Delivery details</p>
          <h2 className="mt-1 font-heading text-2xl text-forest">Saved addresses</h2>
        </div>
        <button type="button" onClick={() => setEditing({ ...emptyAddress })} className="flex min-h-11 items-center gap-2 rounded-md bg-forest px-4 text-sm font-semibold text-white hover:bg-forest-light">
          <Plus className="h-4 w-4" aria-hidden="true" /> Add address
        </button>
      </div>
      {addresses.length ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <article key={address.id} className="rounded-lg border border-[#e8ddc8] bg-cream/50 p-5">
              <div className="flex items-start justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-bold text-forest"><MapPin className="h-4 w-4 text-gold" aria-hidden="true" /> {address.label}</span>
                {address.isDefault && <span className="rounded-full bg-forest px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Default</span>}
              </div>
              <address className="mt-3 text-sm not-italic leading-6 text-muted">
                <strong className="text-[#2b2b2b]">{address.name}</strong><br />
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                {address.city}, {address.state} {address.pincode}<br />+91 {address.phone}
              </address>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setEditing({ ...address })} className="flex min-h-11 items-center gap-2 rounded-md border border-[#d8caaa] px-3 text-xs font-semibold text-forest"><Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit</button>
                <button type="button" onClick={() => { removeAddress(address.id); toast("Address removed."); }} className="flex min-h-11 items-center gap-2 rounded-md px-3 text-xs font-semibold text-red-800 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove</button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-lg border border-dashed border-[#d8caaa] bg-cream/40 px-5 py-8 text-center">
          <MapPin className="mx-auto h-6 w-6 text-gold" aria-hidden="true" />
          <p className="mt-3 text-sm font-semibold text-forest">No saved addresses yet</p>
          <p className="mt-1 text-xs text-muted">Add one now or save it during checkout.</p>
        </div>
      )}

      <Dialog open={Boolean(editing)} onClose={() => { setEditing(null); setError(""); }} title={editing?.id ? "Edit address" : "Add an address"}>
        {editing && (
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2" noValidate>
            {[
              ["label", "Label", "Home"],
              ["name", "Recipient name", "Full name"],
              ["phone", "Phone number", "10-digit number"],
              ["line1", "Address line 1", "House and street"],
              ["line2", "Address line 2 (optional)", "Landmark or area"],
              ["city", "City", "City"],
              ["state", "State", "State"],
              ["pincode", "Pincode", "6 digits"],
            ].map(([field, label, placeholder]) => (
              <label key={field} className={`text-sm font-semibold text-forest ${field === "line1" || field === "line2" ? "sm:col-span-2" : ""}`}>
                {label}
                <Input className="mt-2 font-normal text-[#2b2b2b]" value={String(editing[field as keyof Address] ?? "")} onChange={(event) => setEditing({ ...editing, [field]: field === "phone" || field === "pincode" ? event.target.value.replace(/\D/g, "") : event.target.value })} maxLength={field === "phone" ? 10 : field === "pincode" ? 6 : undefined} inputMode={field === "phone" || field === "pincode" ? "numeric" : undefined} placeholder={placeholder} />
              </label>
            ))}
            <label className="flex min-h-11 items-center gap-3 text-sm font-medium text-forest sm:col-span-2">
              <input type="checkbox" checked={editing.isDefault} onChange={(event) => setEditing({ ...editing, isDefault: event.target.checked })} className="h-4 w-4 accent-forest" /> Use as default address
            </label>
            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800 sm:col-span-2" role="alert">{error}</p>}
            <div className="flex justify-end gap-3 sm:col-span-2">
              <button type="button" onClick={() => setEditing(null)} className="min-h-11 rounded-md border border-[#d8caaa] px-5 text-sm font-semibold text-forest">Cancel</button>
              <button type="submit" className="min-h-11 rounded-md bg-forest px-5 text-sm font-semibold text-white">Save address</button>
            </div>
          </form>
        )}
      </Dialog>
    </section>
  );
}
