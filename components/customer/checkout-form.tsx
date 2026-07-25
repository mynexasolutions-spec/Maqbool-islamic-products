"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BadgePercent, Check, CreditCard, LoaderCircle, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { useCart } from "@/components/providers/cart-provider";
import { useCustomer } from "@/components/providers/customer-provider";
import { useToast } from "@/components/providers/toast-provider";
import { Input } from "@/components/ui/input";
import { calculateCheckout, COUPON_CODE, formatPrice, FREE_SHIPPING_THRESHOLD } from "@/lib/commerce";
import type { Address, MockOrder, PaymentMethod } from "@/lib/models";

function blankAddress(name: string, phone: string): Address {
  return { id: "", label: "Home", name, phone, line1: "", line2: "", city: "", state: "", pincode: "", isDefault: false };
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const { customer, addresses, saveAddress, addOrder } = useCustomer();
  const { toast } = useToast();
  const [address, setAddress] = useState<Address>(() => blankAddress(customer?.name ?? "", customer?.phone ?? ""));
  const [selectedAddress, setSelectedAddress] = useState("new");
  const [saveForLater, setSaveForLater] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);
  const totals = useMemo(() => calculateCheckout(items, appliedCoupon, paymentMethod), [appliedCoupon, items, paymentMethod]);

  function chooseAddress(id: string) {
    setSelectedAddress(id);
    if (id === "new") {
      setAddress(blankAddress(customer?.name ?? "", customer?.phone ?? ""));
      return;
    }
    const saved = addresses.find((item) => item.id === id);
    if (saved) setAddress({ ...saved });
  }

  function applyCoupon() {
    if (couponInput.trim().toUpperCase() !== COUPON_CODE) {
      setAppliedCoupon("");
      setCouponMessage("This coupon is not valid. Try MAQBOOL10.");
      return;
    }
    setAppliedCoupon(COUPON_CODE);
    setCouponInput(COUPON_CODE);
    setCouponMessage("10% discount applied.");
  }

  async function placeOrder(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (!items.length) {
      setError("Your bag is empty.");
      return;
    }
    if (!address.name.trim() || !address.line1.trim() || !address.city.trim() || !address.state.trim()) {
      setError("Complete all required delivery fields.");
      return;
    }
    if (!/^[6-9]\d{9}$/.test(address.phone) || !/^\d{6}$/.test(address.pincode)) {
      setError("Enter a valid 10-digit phone number and 6-digit pincode.");
      return;
    }
    if (!customer) {
      router.replace("/login?returnTo=%2Fcheckout");
      return;
    }

    setProcessing(true);
    await new Promise((resolve) => window.setTimeout(resolve, paymentMethod === "online" ? 900 : 450));
    const finalAddress = { ...address, id: address.id || `addr-${Date.now()}` };
    if (saveForLater && selectedAddress === "new") saveAddress(finalAddress);
    const order: MockOrder = {
      id: `MQB${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer,
      address: finalAddress,
      items: items.map((item) => ({ ...item })),
      ...totals,
      paymentMethod,
      status: "confirmed",
    };
    addOrder(order);
    clear();
    toast("Order placed successfully.");
    router.replace(`/order-success/${order.id}`);
  }

  if (!items.length) {
    return (
      <div className="site-container py-16">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#e8ddc8] bg-white px-7 py-12 text-center">
          <PackageCheck className="mx-auto h-10 w-10 text-gold" aria-hidden="true" />
          <h1 className="mt-5 font-heading text-3xl text-forest">Your bag is empty</h1>
          <p className="mt-3 text-sm leading-6 text-muted">Add something meaningful before beginning checkout.</p>
          <Link href="/shop" className="mt-7 inline-flex min-h-11 items-center rounded-md bg-forest px-6 text-sm font-semibold text-white">Browse products</Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={placeOrder} className="site-container grid gap-8 py-12 lg:grid-cols-[1fr_390px]" noValidate>
      <div className="space-y-7">
        <section className="rounded-xl border border-[#e8ddc8] bg-white p-6 sm:p-8" aria-labelledby="delivery-heading">
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-sm font-bold text-white">1</span><div><p className="text-xs font-bold uppercase tracking-[.15em] text-gold">Where should it go?</p><h1 id="delivery-heading" className="font-heading text-2xl text-forest">Delivery address</h1></div></div>
          {addresses.length > 0 && (
            <fieldset className="mt-7">
              <legend className="text-sm font-semibold text-forest">Choose a saved address</legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {addresses.map((saved) => (
                  <label key={saved.id} className={`cursor-pointer rounded-lg border p-4 text-sm ${selectedAddress === saved.id ? "border-forest bg-cream" : "border-[#e8ddc8]"}`}>
                    <input type="radio" name="saved-address" value={saved.id} checked={selectedAddress === saved.id} onChange={() => chooseAddress(saved.id)} className="mr-2 accent-forest" />
                    <strong className="text-forest">{saved.label}</strong>
                    <span className="mt-2 block text-xs leading-5 text-muted">{saved.line1}, {saved.city} {saved.pincode}</span>
                  </label>
                ))}
                <label className={`cursor-pointer rounded-lg border p-4 text-sm ${selectedAddress === "new" ? "border-forest bg-cream" : "border-[#e8ddc8]"}`}>
                  <input type="radio" name="saved-address" value="new" checked={selectedAddress === "new"} onChange={() => chooseAddress("new")} className="mr-2 accent-forest" />
                  <strong className="text-forest">Use a new address</strong>
                </label>
              </div>
            </fieldset>
          )}
          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            {[
              ["name", "Recipient name", "Full name"],
              ["phone", "Mobile number", "10-digit number"],
              ["line1", "Address line 1", "House number and street"],
              ["line2", "Address line 2 (optional)", "Area or landmark"],
              ["city", "City", "City"],
              ["state", "State", "State"],
              ["pincode", "Pincode", "6 digits"],
            ].map(([field, label, placeholder]) => (
              <label key={field} className={`text-sm font-semibold text-forest ${field === "line1" || field === "line2" ? "sm:col-span-2" : ""}`}>
                {label}
                <Input className="mt-2 font-normal text-[#2b2b2b]" value={String(address[field as keyof Address] ?? "")} onChange={(event) => setAddress({ ...address, [field]: field === "phone" || field === "pincode" ? event.target.value.replace(/\D/g, "") : event.target.value })} maxLength={field === "phone" ? 10 : field === "pincode" ? 6 : undefined} inputMode={field === "phone" || field === "pincode" ? "numeric" : undefined} autoComplete={field === "name" ? "name" : field === "phone" ? "tel-national" : field === "pincode" ? "postal-code" : field === "city" ? "address-level2" : field === "state" ? "address-level1" : "street-address"} placeholder={placeholder} />
              </label>
            ))}
          </div>
          {selectedAddress === "new" && <label className="mt-5 flex min-h-11 items-center gap-3 text-sm font-medium text-forest"><input type="checkbox" checked={saveForLater} onChange={(event) => setSaveForLater(event.target.checked)} className="h-4 w-4 accent-forest" /> Save this address to my account</label>}
        </section>

        <section className="rounded-xl border border-[#e8ddc8] bg-white p-6 sm:p-8" aria-labelledby="payment-heading">
          <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-full bg-forest text-sm font-bold text-white">2</span><div><p className="text-xs font-bold uppercase tracking-[.15em] text-gold">Complete your order</p><h2 id="payment-heading" className="font-heading text-2xl text-forest">Payment method</h2></div></div>
          <fieldset className="mt-7 grid gap-3">
            <legend className="sr-only">Choose payment method</legend>
            <label className={`flex cursor-pointer items-start gap-4 rounded-lg border p-5 ${paymentMethod === "cod" ? "border-forest bg-cream" : "border-[#e8ddc8]"}`}>
              <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} className="mt-1 accent-forest" />
              <Truck className="h-5 w-5 text-gold" aria-hidden="true" />
              <span><strong className="block text-sm text-forest">Cash on delivery</strong><small className="mt-1 block text-xs leading-5 text-muted">Pay when your parcel arrives. A small handling charge applies.</small></span>
            </label>
            <label className={`flex cursor-pointer items-start gap-4 rounded-lg border p-5 ${paymentMethod === "online" ? "border-forest bg-cream" : "border-[#e8ddc8]"}`}>
              <input type="radio" name="payment" value="online" checked={paymentMethod === "online"} onChange={() => setPaymentMethod("online")} className="mt-1 accent-forest" />
              <CreditCard className="h-5 w-5 text-gold" aria-hidden="true" />
              <span><strong className="block text-sm text-forest">Online payment (demo)</strong><small className="mt-1 block text-xs leading-5 text-muted">Simulates a successful payment. No card or bank details are requested or charged.</small></span>
            </label>
          </fieldset>
        </section>
      </div>

      <aside className="h-fit rounded-xl border border-[#e8ddc8] bg-white p-6 shadow-[0_15px_45px_rgba(15,56,44,.08)] lg:sticky lg:top-28" aria-labelledby="summary-heading">
        <h2 id="summary-heading" className="font-heading text-2xl text-forest">Order summary</h2>
        <ul className="mt-5 space-y-4">
          {items.map((item) => <li key={item.id} className="flex justify-between gap-3 text-sm"><span className="text-muted"><strong className="font-semibold text-[#2b2b2b]">{item.name}</strong><small className="mt-0.5 block">{item.variantName} · Qty {item.quantity}</small></span><strong className="min-w-fit text-forest">{formatPrice(item.price * item.quantity)}</strong></li>)}
        </ul>
        <div className="mt-6 border-y border-[#e8ddc8] py-5">
          <label htmlFor="coupon" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-forest"><BadgePercent className="h-4 w-4 text-gold" /> Coupon code</label>
          <div className="mt-2 flex gap-2"><Input id="coupon" value={couponInput} onChange={(event) => setCouponInput(event.target.value.toUpperCase())} placeholder="Enter code" /><button type="button" onClick={applyCoupon} className="min-h-11 rounded-md border border-forest px-4 text-xs font-bold text-forest">Apply</button></div>
          {couponMessage && <p className={`mt-2 text-xs ${appliedCoupon ? "text-emerald-800" : "text-red-800"}`} role="status">{appliedCoupon && <Check className="mr-1 inline h-3 w-3" />}{couponMessage}</p>}
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted">Shipping</dt><dd>{totals.shipping ? formatPrice(totals.shipping) : "Free"}</dd></div>
          {totals.discount > 0 && <div className="flex justify-between text-emerald-800"><dt>Coupon discount</dt><dd>−{formatPrice(totals.discount)}</dd></div>}
          {totals.codCharge > 0 && <div className="flex justify-between"><dt className="text-muted">COD handling</dt><dd>{formatPrice(totals.codCharge)}</dd></div>}
          <div className="flex justify-between border-t border-[#e8ddc8] pt-4 font-heading text-xl text-forest"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
        </dl>
        {totals.subtotal < FREE_SHIPPING_THRESHOLD && <p className="mt-4 rounded-md bg-cream px-3 py-2 text-xs text-muted">Add {formatPrice(FREE_SHIPPING_THRESHOLD - totals.subtotal)} more for free shipping.</p>}
        {error && <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>}
        <button type="submit" disabled={processing} aria-busy={processing} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-forest px-5 text-sm font-bold text-white hover:bg-forest-light disabled:opacity-60">
          {processing ? <><LoaderCircle className="h-4 w-4 animate-spin" /> {paymentMethod === "online" ? "Simulating payment…" : "Placing order…"}</> : paymentMethod === "online" ? "Simulate payment & order" : "Place COD order"}
        </button>
        <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold" /> By placing this demo order, you agree to our <Link href="/policies/terms" className="font-semibold text-forest underline">terms</Link>.</p>
      </aside>
    </form>
  );
}
