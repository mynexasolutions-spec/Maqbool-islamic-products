"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { useCart } from "@/components/providers/cart-provider";
import { useCustomer } from "@/components/providers/customer-provider";
import { useToast } from "@/components/providers/toast-provider";
import { formatPrice } from "@/lib/commerce";
import { useMarket } from "@/components/providers/market-provider";
import { marketHref } from "@/lib/markets";

export function CartDrawer() {
  const router = useRouter();
  const { customer } = useCustomer();
  const { items, subtotal, isOpen, setOpen, updateQuantity, removeItem } = useCart();
  const { toast } = useToast();
  const { marketSlug } = useMarket();

  return (
    <Drawer open={isOpen} onClose={() => setOpen(false)} title={`Your bag (${items.reduce((sum, item) => sum + item.quantity, 0)})`}>
      {!items.length ? (
        <div className="grid min-h-[55vh] place-items-center text-center">
          <div>
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-cream text-forest"><ShoppingBag className="h-7 w-7" aria-hidden="true" /></span>
            <h3 className="mt-5 font-heading text-xl text-forest">Your bag is waiting</h3>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted">Discover thoughtful essentials for worship, reflection, and gifting.</p>
            <button type="button" onClick={() => { setOpen(false); router.push(marketHref(marketSlug, "/shop")); }} className="mt-6 min-h-11 rounded-md bg-forest px-6 text-sm font-semibold text-white">Explore the shop</button>
          </div>
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-110px)] flex-col">
          <ul className="flex-1 space-y-5">
            {items.map((item) => (
              <li key={item.id} className="grid grid-cols-[76px_1fr] gap-4 border-b border-[#eee7d8] pb-5">
                <div className="relative h-[92px] overflow-hidden rounded-lg bg-cream">
                  {item.image ? <Image src={item.image} alt="" fill sizes="76px" className="object-cover" /> : <ShoppingBag className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-gold" aria-hidden="true" />}
                </div>
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div><p className="text-sm font-semibold leading-5 text-forest">{item.name}</p><p className="mt-1 text-xs text-muted">{item.variantName}</p></div>
                    <button type="button" onClick={() => { removeItem(item.id); toast(`${item.name} removed.`); }} aria-label={`Remove ${item.name}`} className="grid min-h-11 min-w-11 place-items-center text-muted hover:text-red-800"><Trash2 className="h-4 w-4" /></button>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-md border border-[#d8caaa]">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} disabled={item.quantity <= 1} aria-label={`Decrease ${item.name} quantity`} className="grid min-h-11 min-w-11 place-items-center disabled:opacity-30"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-8 text-center text-sm" aria-live="polite">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} disabled={item.quantity >= item.stock} aria-label={`Increase ${item.name} quantity`} className="grid min-h-11 min-w-11 place-items-center disabled:opacity-30"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                    <strong className="text-sm text-forest">{formatPrice(item.price * item.quantity, marketSlug)}</strong>
                  </div>
                  {item.quantity >= item.stock && <p className="mt-2 text-xs text-amber-800" role="status">Maximum available quantity reached.</p>}
                </div>
              </li>
            ))}
          </ul>
          <div className="sticky bottom-0 mt-6 border-t border-[#e4d8c1] bg-white pt-5">
            <div className="flex items-center justify-between"><span className="text-sm font-semibold text-muted">Subtotal</span><strong className="font-heading text-xl text-forest">{formatPrice(subtotal, marketSlug)}</strong></div>
            <p className="mt-2 text-xs text-muted">Shipping, offers, and COD charges are calculated at checkout.</p>
            <button type="button" onClick={() => { setOpen(false); router.push(customer ? marketHref(marketSlug, "/checkout") : `${marketHref(marketSlug, "/login")}?returnTo=${encodeURIComponent(marketHref(marketSlug, "/checkout"))}`); }} className="mt-5 min-h-12 w-full rounded-md bg-forest px-5 text-sm font-bold text-white hover:bg-forest-light">
              Continue to checkout
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
