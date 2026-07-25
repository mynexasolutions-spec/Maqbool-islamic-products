"use client";

import { CheckCircle2, Clock3, Info, Mail, MapPin, Star } from "lucide-react";
import { Table } from "@/components/ui/table";
import { useAdminStore } from "./admin-store";
import { AdminPageHeader, AdminPanel, EmptyAdminState, StatusPill } from "./admin-ui";

type ModuleKind = "customers" | "reviews" | "inquiries" | "coupons" | "shipping" | "announcements";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

const details: Record<ModuleKind, { eyebrow: string; title: string; description: string }> = {
  customers: { eyebrow: "Audience", title: "Customers", description: "Review customer activity and lifetime value. Customer records are read-only in Part 1." },
  reviews: { eyebrow: "Engagement", title: "Reviews", description: "Monitor recent product feedback and moderation state. Review actions arrive in Part 2." },
  inquiries: { eyebrow: "Support", title: "Inquiries", description: "Keep sight of storefront questions. Reply workflows arrive with the live backend." },
  coupons: { eyebrow: "Promotions", title: "Coupons", description: "Review the active demo promotion used by checkout." },
  shipping: { eyebrow: "Fulfilment", title: "Shipping", description: "Review the current frontend shipping rules and thresholds." },
  announcements: { eyebrow: "Storefront", title: "Announcements", description: "Preview scheduled storefront notices. Publishing arrives in Part 2." },
};

const reviews = [
  { id: "REV-104", customer: "Maryam Ali", product: "Premium Velvet Prayer Mat", rating: 5, text: "Beautiful finish and very comfortable.", status: "Published" },
  { id: "REV-103", customer: "Ayaan Khan", product: "The Holy Quran (Arabic Text)", rating: 5, text: "Clear print and excellent binding.", status: "Published" },
  { id: "REV-102", customer: "Zoya Siddiqui", product: "Royal Trio Concentrated Perfume Oil", rating: 4, text: "Elegant fragrances and gift packaging.", status: "Pending" },
];
const inquiries = [
  { id: "INQ-88", name: "Sana Mirza", subject: "Bulk gifting availability", received: "25 Jul, 10:24", status: "New" },
  { id: "INQ-87", name: "Rehan Ansari", subject: "Delivery estimate for Kashmir", received: "24 Jul, 16:40", status: "Open" },
  { id: "INQ-86", name: "Fariha Noor", subject: "Quran edition language", received: "23 Jul, 12:15", status: "Resolved" },
];

export function ReadOnlyModule({ kind }: { kind: ModuleKind }) {
  const meta = details[kind];
  return <><AdminPageHeader {...meta} />{kind === "customers" ? <Customers /> : kind === "reviews" ? <Reviews /> : kind === "inquiries" ? <Inquiries /> : kind === "coupons" ? <Coupons /> : kind === "shipping" ? <Shipping /> : <Announcements />}</>;
}

function Customers() {
  const { customers } = useAdminStore();
  return <AdminPanel>{customers.length ? <Table><thead className="bg-[#f8f6f0] text-[11px] uppercase tracking-[.12em] text-[#69766f]"><tr><th className="px-5 py-3">Customer</th><th className="px-4 py-3">Phone</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Lifetime spend</th><th className="px-5 py-3">Joined</th></tr></thead><tbody className="divide-y divide-[#eee9df]">{customers.map((item) => <tr key={item.id}><td className="px-5 py-4 font-bold text-[#263d35]">{item.name}</td><td className="px-4 py-4">{item.phone}</td><td className="px-4 py-4">{item.orders}</td><td className="px-4 py-4 font-bold">{currency.format(item.spent)}</td><td className="px-5 py-4">{new Date(item.joinedAt).toLocaleDateString("en-IN")}</td></tr>)}</tbody></Table> : <EmptyAdminState title="No customers" description="Demo customer records will appear here." />}</AdminPanel>;
}
function Reviews() {
  return <AdminPanel><div className="divide-y divide-[#eee9df]">{reviews.map((item) => <article key={item.id} className="p-5"><div className="flex flex-wrap items-center gap-3"><p className="font-bold text-[#263d35]">{item.customer}</p><span className="flex text-[#bd8628]" aria-label={`${item.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-3.5 w-3.5" fill={index < item.rating ? "currentColor" : "none"} aria-hidden="true" />)}</span><StatusPill active={item.status === "Published"} label={item.status} /></div><p className="mt-1 text-xs font-semibold text-[#718079]">{item.product} · {item.id}</p><p className="mt-3 text-sm text-[#4f5e58]">{item.text}</p></article>)}</div></AdminPanel>;
}
function Inquiries() {
  return <AdminPanel><Table><thead className="bg-[#f8f6f0] text-[11px] uppercase tracking-[.12em] text-[#69766f]"><tr><th className="px-5 py-3">Inquiry</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Received</th><th className="px-5 py-3">Status</th></tr></thead><tbody className="divide-y divide-[#eee9df]">{inquiries.map((item) => <tr key={item.id}><td className="px-5 py-4"><p className="font-bold">{item.name}</p><p className="text-xs text-[#718079]">{item.id}</p></td><td className="px-4 py-4">{item.subject}</td><td className="px-4 py-4">{item.received}</td><td className="px-5 py-4"><StatusPill active={item.status !== "Resolved"} label={item.status} /></td></tr>)}</tbody></Table></AdminPanel>;
}
function Coupons() {
  return <AdminPanel className="p-5"><div className="flex flex-col gap-5 rounded-xl border border-dashed border-[#c9aa67] bg-[#fbf8ef] p-5 sm:flex-row sm:items-center"><div className="grid h-12 w-12 place-items-center rounded-xl bg-[#123d32] text-white"><CheckCircle2 className="h-5 w-5" /></div><div className="flex-1"><div className="flex items-center gap-3"><h2 className="font-heading text-xl text-[#123d32]">MAQBOOL10</h2><StatusPill active label="Active" /></div><p className="mt-1 text-sm text-[#64716c]">10% off cart subtotal · frontend demo checkout only</p></div><p className="text-sm font-bold text-[#86651f]">No usage limit</p></div></AdminPanel>;
}
function Shipping() {
  const rules = [{ title: "Standard shipping", detail: "₹60 when subtotal is below ₹999", icon: MapPin }, { title: "Free shipping", detail: "Applied automatically at ₹999 or above", icon: CheckCircle2 }, { title: "Cash on delivery", detail: "₹30 COD handling charge", icon: Clock3 }];
  return <div className="grid gap-4 md:grid-cols-3">{rules.map((rule) => { const Icon = rule.icon; return <AdminPanel key={rule.title} className="p-5"><span className="mb-4 grid h-10 w-10 place-items-center rounded-lg bg-[#eee9dc] text-[#86651f]"><Icon className="h-5 w-5" /></span><h2 className="font-heading text-lg text-[#123d32]">{rule.title}</h2><p className="mt-2 text-sm leading-6 text-[#65736d]">{rule.detail}</p></AdminPanel>; })}</div>;
}
function Announcements() {
  return <AdminPanel><div className="divide-y divide-[#eee9df]"><div className="flex gap-4 p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#e4f1eb] text-[#176342]"><Mail className="h-5 w-5" /></span><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-bold text-[#263d35]">Free shipping above ₹999</h2><StatusPill active label="Preview" /></div><p className="mt-1 text-sm text-[#65736d]">Prepared for the storefront announcement bar.</p></div></div><div className="flex gap-4 p-5"><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[#eee9dc] text-[#86651f]"><Info className="h-5 w-5" /></span><div><h2 className="font-bold text-[#263d35]">Eid gifting collection</h2><p className="mt-1 text-sm text-[#65736d]">Draft · publishing controls are unavailable in Part 1.</p></div></div></div></AdminPanel>;
}
