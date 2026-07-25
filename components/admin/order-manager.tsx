"use client";

import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import type { AdminOrderRecord, OrderStatus } from "@/lib/models";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { useAdminStore } from "./admin-store";
import { AdminPageHeader, AdminPanel, EmptyAdminState, StatusPill } from "./admin-ui";

const statuses: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export function OrderManager() {
  const { orders, updateOrderStatus } = useAdminStore();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AdminOrderRecord | null>(null);
  const [message, setMessage] = useState("");
  const filtered = useMemo(() => orders.filter((order) => (`${order.id} ${order.customer.name} ${order.customer.phone}`.toLowerCase().includes(query.toLowerCase())) && (status === "all" || order.status === status)), [orders, query, status]);

  return <>
    <div role="status" aria-live="polite" className="sr-only">{message}</div>
    <AdminPageHeader eyebrow="Fulfilment" title="Orders" description="Review demo orders and move them through the fulfilment lifecycle." />
    <AdminPanel>
      <div className="grid gap-3 border-b border-[#e8e3d8] p-4 md:grid-cols-[1fr_220px]"><label className="relative"><span className="sr-only">Search orders</span><Search className="absolute left-3 top-3 h-4 w-4 text-[#718079]" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order ID, customer, or phone…" /></label><label><span className="sr-only">Filter by order status</span><Select className="w-full" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option>{statuses.map((item) => <option key={item}>{item}</option>)}</Select></label></div>
      {filtered.length ? <Table><thead className="bg-[#f8f6f0] text-[11px] uppercase tracking-[.12em] text-[#69766f]"><tr><th className="px-5 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">View</th></tr></thead><tbody className="divide-y divide-[#eee9df]">{filtered.map((order) => <tr key={order.id}><td className="px-5 py-4"><p className="font-bold text-[#263d35]">{order.id}</p><p className="text-xs text-[#74807b]">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p></td><td className="px-4 py-4"><p className="font-semibold">{order.customer.name}</p><p className="text-xs text-[#74807b]">{order.customer.phone}</p></td><td className="px-4 py-4 font-bold">{currency.format(order.total)}</td><td className="px-4 py-4 uppercase text-xs font-bold">{order.paymentMethod}</td><td className="px-4 py-4"><Select aria-label={`Status for order ${order.id}`} value={order.status} onChange={(event) => { const next = event.target.value as OrderStatus; updateOrderStatus(order.id, next); setMessage(`${order.id} changed to ${next}.`); }} className="w-36">{statuses.map((item) => <option key={item}>{item}</option>)}</Select></td><td className="px-5 py-4 text-right"><button onClick={() => setSelected(order)} className="grid min-h-10 min-w-10 place-items-center rounded-lg text-[#35584d] hover:bg-[#e8f0ec]" aria-label={`View order ${order.id}`}><Eye className="h-4 w-4" /></button></td></tr>)}</tbody></Table> : <EmptyAdminState title="No orders found" description="Adjust your filters to see order records." />}
    </AdminPanel>
    <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} title={selected ? `Order ${selected.id}` : "Order details"}>{selected && <OrderDetails order={selected} />}</Dialog>
  </>;
}

function OrderDetails({ order }: { order: AdminOrderRecord }) {
  return <div className="space-y-5 text-sm"><div className="flex items-center justify-between rounded-lg bg-[#f4f1e8] p-4"><div><p className="text-xs text-[#6b7872]">Placed</p><p className="font-bold">{new Date(order.createdAt).toLocaleString("en-IN")}</p></div><StatusPill active={order.status !== "cancelled"} label={order.status} /></div><div><h3 className="mb-2 font-bold text-[#123d32]">Items</h3>{order.items.map((item) => <div key={item.id} className="flex justify-between border-b py-3"><div><p className="font-semibold">{item.name}</p><p className="text-xs text-[#74807b]">{item.variantName} × {item.quantity}</p></div><p className="font-bold">{currency.format(item.price * item.quantity)}</p></div>)}</div><div className="grid gap-4 sm:grid-cols-2"><div><h3 className="mb-1 font-bold text-[#123d32]">Customer</h3><p>{order.customer.name}</p><p>{order.customer.phone}</p></div><div><h3 className="mb-1 font-bold text-[#123d32]">Ship to</h3><p>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p><p>{order.address.city}, {order.address.state} {order.address.pincode}</p></div></div><dl className="space-y-2 rounded-lg bg-[#f8f6f0] p-4"><div className="flex justify-between"><dt>Subtotal</dt><dd>{currency.format(order.subtotal)}</dd></div><div className="flex justify-between"><dt>Shipping</dt><dd>{currency.format(order.shipping)}</dd></div><div className="flex justify-between"><dt>Discount</dt><dd>−{currency.format(order.discount)}</dd></div><div className="flex justify-between"><dt>COD charge</dt><dd>{currency.format(order.codCharge)}</dd></div><div className="flex justify-between border-t pt-2 font-bold text-[#123d32]"><dt>Total</dt><dd>{currency.format(order.total)}</dd></div></dl></div>;
}
