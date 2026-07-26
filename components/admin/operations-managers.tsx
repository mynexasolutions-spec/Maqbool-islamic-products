"use client";

import { FormEvent, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Pencil, Search, ShieldBan, Trash2, X } from "lucide-react";
import {
  deleteCoupon, deleteReview, moderateReview, saveAdminProfile, saveAnnouncement,
  saveCoupon, setCustomerActive,
} from "@/app/admin/operations/actions";
import type {
  getAdminProfile, getAnnouncement, getCouponData, getCustomers, getReviews,
} from "@/app/admin/operations/actions";
import { AdminPageHeader, AdminPanel, EmptyAdminState, StatusPill } from "./admin-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type Customers = Awaited<ReturnType<typeof getCustomers>>;
type Reviews = Awaited<ReturnType<typeof getReviews>>;
type CouponData = Awaited<ReturnType<typeof getCouponData>>;
type Announcement = Awaited<ReturnType<typeof getAnnouncement>>;
type AdminProfile = Awaited<ReturnType<typeof getAdminProfile>>;

function Feedback({ message, error }: { message: string; error: string }) {
  return <><p className="mb-3 min-h-5 text-sm font-semibold text-[#176342]" role="status">{message}</p>{error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}</>;
}

export function CustomerManager({ customers }: { customers: Customers }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const filtered = useMemo(() => customers.filter((item) =>
    `${item.name} ${item.phone} ${item.email ?? ""}`.toLowerCase().includes(query.toLowerCase())), [customers, query]);
  const toggle = (id: string, active: boolean) => startTransition(async () => {
    setError("");
    const result = await setCustomerActive(id, active);
    if (result.ok) { setMessage(result.message); router.refresh(); } else setError(result.error);
  });
  return <>
    <AdminPageHeader eyebrow="Audience" title="Customers" description="Customer records are created automatically from completed checkout orders." />
    <Feedback message={message} error={error} />
    <AdminPanel>
      <label className="relative block border-b p-4"><span className="sr-only">Search customers</span><Search className="absolute left-7 top-7 h-4 w-4 text-[#718079]" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, phone or email…" /></label>
      {filtered.length ? <Table><thead className="bg-[#f8f6f0] text-xs uppercase text-[#69766f]"><tr><th className="px-5 py-3">Customer</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Lifetime spend</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Action</th></tr></thead><tbody className="divide-y">{filtered.map((item) => <tr key={item.id}><td className="px-5 py-4"><p className="font-bold text-[#263d35]">{item.name}</p><p className="text-xs text-[#74807b]">{item.phone}{item.email ? ` · ${item.email}` : ""}</p></td><td className="px-4 py-4">{item.orderCount}</td><td className="px-4 py-4">{Object.entries(item.spendByCurrency).length ? Object.entries(item.spendByCurrency).map(([currency, value]) => <span key={currency} className="mr-3 whitespace-nowrap font-semibold">{new Intl.NumberFormat("en", { style: "currency", currency }).format(value)}</span>) : "—"}</td><td className="px-4 py-4"><StatusPill active={item.is_active} label={item.is_active ? "Active" : "Suspended"} /></td><td className="px-5 py-4 text-right"><Button variant={item.is_active ? "outline" : "default"} disabled={pending} onClick={() => toggle(item.id, !item.is_active)}>{item.is_active ? <><ShieldBan className="mr-2 h-4 w-4" />Suspend</> : "Reactivate"}</Button></td></tr>)}</tbody></Table> : <EmptyAdminState title="No customers found" description="Customer records appear after the first database-backed checkout." />}
    </AdminPanel>
  </>;
}

export function ReviewManager({ reviews }: { reviews: Reviews }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const act = (task: Promise<{ ok: true; message: string } | { ok: false; error: string }>) => startTransition(async () => {
    setError(""); const result = await task;
    if (result.ok) { setMessage(result.message); router.refresh(); } else setError(result.error);
  });
  return <>
    <AdminPageHeader eyebrow="Engagement" title="Reviews" description="Approve verified purchases before feedback appears on the storefront." />
    <Feedback message={message} error={error} />
    <AdminPanel>{reviews.length ? <div className="divide-y">{reviews.map((review) => <article key={review.id} className="p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-3"><h2 className="font-bold text-[#263d35]">{review.customer_name}</h2><StatusPill active={review.status === "approved"} label={review.status} /></div><p className="mt-1 text-xs text-[#718079]">{review.productName} · {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)} · Verified order</p></div><div className="flex gap-2"><Button size="sm" disabled={pending || review.status === "approved"} onClick={() => act(moderateReview(review.id, "approved"))}><Check className="mr-1 h-4 w-4" />Approve</Button><Button size="sm" variant="outline" disabled={pending || review.status === "rejected"} onClick={() => act(moderateReview(review.id, "rejected"))}><X className="mr-1 h-4 w-4" />Reject</Button><Button size="icon" variant="destructive" disabled={pending} aria-label={`Delete review by ${review.customer_name}`} onClick={() => act(deleteReview(review.id))}><Trash2 className="h-4 w-4" /></Button></div></div><p className="mt-4 text-sm leading-6 text-[#4f5e58]">{review.body}</p></article>)}</div> : <EmptyAdminState title="No reviews" description="Verified storefront submissions will enter this moderation queue." />}</AdminPanel>
  </>;
}

const blankCoupon: { id: string; marketId: string; code: string; discountType: "percentage" | "flat"; discountValue: number; minimumPurchase: number; startsAt: string; endsAt: string; usageLimit: string; isActive: boolean } =
  { id: "", marketId: "", code: "", discountType: "percentage", discountValue: 10, minimumPurchase: 0, startsAt: "", endsAt: "", usageLimit: "", isActive: true };

export function CouponManager({ data }: { data: CouponData }) {
  const router = useRouter();
  const [draft, setDraft] = useState({ ...blankCoupon, marketId: data.markets[0]?.id ?? "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      setError("");
      const result = await saveCoupon({
        id: draft.id || undefined, marketId: draft.marketId, code: draft.code,
        discountType: draft.discountType, discountValue: Number(draft.discountValue),
        minimumPurchase: Number(draft.minimumPurchase), startsAt: draft.startsAt || undefined,
        endsAt: draft.endsAt || undefined, usageLimit: draft.usageLimit ? Number(draft.usageLimit) : null,
        isActive: draft.isActive,
      });
      if (result.ok) { setMessage(result.message); setDraft({ ...blankCoupon, marketId: data.markets[0]?.id ?? "" }); router.refresh(); } else setError(result.error);
    });
  };
  const remove = (id: string) => startTransition(async () => {
    const result = await deleteCoupon(id);
    if (result.ok) { setMessage(result.message); router.refresh(); } else setError(result.error);
  });
  return <>
    <AdminPageHeader eyebrow="Promotions" title="Coupons" description="Create currency-safe discount codes for one market at a time." />
    <Feedback message={message} error={error} />
    <AdminPanel className="mb-6 p-5"><form onSubmit={submit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <label className="text-sm font-semibold">Market<Select className="mt-2 w-full" value={draft.marketId} onChange={(e) => setDraft({ ...draft, marketId: e.target.value })}>{data.markets.map((market) => <option key={market.id} value={market.id}>{market.name} ({market.currency_code})</option>)}</Select></label>
      <label className="text-sm font-semibold">Code<Input className="mt-2 uppercase" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })} required /></label>
      <label className="text-sm font-semibold">Discount type<Select className="mt-2 w-full" value={draft.discountType} onChange={(e) => setDraft({ ...draft, discountType: e.target.value as "percentage" | "flat" })}><option value="percentage">Percentage</option><option value="flat">Flat amount</option></Select></label>
      <label className="text-sm font-semibold">Discount value<Input className="mt-2" type="number" min="0.01" step="0.01" value={draft.discountValue} onChange={(e) => setDraft({ ...draft, discountValue: Number(e.target.value) })} /></label>
      <label className="text-sm font-semibold">Minimum purchase<Input className="mt-2" type="number" min="0" step="0.01" value={draft.minimumPurchase} onChange={(e) => setDraft({ ...draft, minimumPurchase: Number(e.target.value) })} /></label>
      <label className="text-sm font-semibold">Starts at<Input className="mt-2" type="datetime-local" value={draft.startsAt} onChange={(e) => setDraft({ ...draft, startsAt: e.target.value })} /></label>
      <label className="text-sm font-semibold">Ends at<Input className="mt-2" type="datetime-local" value={draft.endsAt} onChange={(e) => setDraft({ ...draft, endsAt: e.target.value })} /></label>
      <label className="text-sm font-semibold">Usage limit<Input className="mt-2" type="number" min="1" value={draft.usageLimit} onChange={(e) => setDraft({ ...draft, usageLimit: e.target.value })} /></label>
      <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={draft.isActive} onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })} />Active</label>
      <div className="flex items-end gap-2 xl:col-span-3"><Button disabled={pending} type="submit">{draft.id ? "Update coupon" : "Create coupon"}</Button>{draft.id && <Button type="button" variant="outline" onClick={() => setDraft({ ...blankCoupon, marketId: data.markets[0]?.id ?? "" })}>Cancel</Button>}</div>
    </form></AdminPanel>
    <AdminPanel>{data.coupons.length ? <Table><thead className="bg-[#f8f6f0] text-xs uppercase"><tr><th className="px-5 py-3">Code</th><th className="px-4 py-3">Market</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y">{data.coupons.map((coupon) => { const market = data.markets.find((item) => item.id === coupon.market_id); return <tr key={coupon.id}><td className="px-5 py-4 font-bold">{coupon.code}</td><td className="px-4 py-4">{market?.name ?? "Unknown"}</td><td className="px-4 py-4">{coupon.discount_type === "percentage" ? `${coupon.discount_value}%` : new Intl.NumberFormat("en", { style: "currency", currency: market?.currency_code ?? "INR" }).format(Number(coupon.discount_value))}</td><td className="px-4 py-4">{coupon.usage_count}{coupon.usage_limit ? ` / ${coupon.usage_limit}` : ""}</td><td className="px-4 py-4"><StatusPill active={coupon.is_active} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button size="icon" variant="outline" aria-label={`Edit ${coupon.code}`} onClick={() => setDraft({ id: coupon.id, marketId: coupon.market_id, code: coupon.code, discountType: coupon.discount_type, discountValue: Number(coupon.discount_value), minimumPurchase: Number(coupon.minimum_purchase), startsAt: coupon.starts_at?.slice(0, 16) ?? "", endsAt: coupon.ends_at?.slice(0, 16) ?? "", usageLimit: coupon.usage_limit ? String(coupon.usage_limit) : "", isActive: coupon.is_active })}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="destructive" aria-label={`Delete ${coupon.code}`} onClick={() => remove(coupon.id)}><Trash2 className="h-4 w-4" /></Button></div></td></tr>; })}</tbody></Table> : <EmptyAdminState title="No coupons" description="Create your first market-specific coupon above." />}</AdminPanel>
  </>;
}

export function AnnouncementManager({ announcement }: { announcement: Announcement }) {
  const [messageText, setMessageText] = useState(announcement.message);
  const [active, setActive] = useState(announcement.is_active);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return <><AdminPageHeader eyebrow="Storefront" title="Announcement" description="Publish one short notice across every market." /><Feedback message={message} error={error} /><AdminPanel className="max-w-3xl p-6"><label className="text-sm font-semibold">Message<Textarea className="mt-2" rows={4} maxLength={240} value={messageText} onChange={(e) => setMessageText(e.target.value)} /></label><p className="mt-2 text-right text-xs text-[#718079]">{messageText.length}/240</p><label className="mt-4 flex min-h-11 items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />Show this announcement</label><Button className="mt-4" disabled={pending} onClick={() => startTransition(async () => { setError(""); const result = await saveAnnouncement(messageText, active); if (result.ok) setMessage(result.message); else setError(result.error); })}>Save announcement</Button></AdminPanel></>;
}

export function AdminProfileManager({ profile }: { profile: AdminProfile }) {
  const [draft, setDraft] = useState({ fullName: profile.full_name, email: profile.email ?? "", phone: profile.phone ?? "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  return <><AdminPageHeader eyebrow="Account" title="Admin profile" description="Store administrator contact details. Environment login credentials remain authoritative." /><Feedback message={message} error={error} /><AdminPanel className="max-w-2xl p-6"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Full name<Input className="mt-2" value={draft.fullName} onChange={(e) => setDraft({ ...draft, fullName: e.target.value })} /></label><label className="text-sm font-semibold">Email<Input className="mt-2" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></label><label className="text-sm font-semibold">Phone<Input className="mt-2" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></label></div><Button className="mt-5" disabled={pending} onClick={() => startTransition(async () => { setError(""); const result = await saveAdminProfile(draft); if (result.ok) setMessage(result.message); else setError(result.error); })}>Save profile</Button></AdminPanel></>;
}
