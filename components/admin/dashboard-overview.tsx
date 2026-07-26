"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, PackageCheck, ShoppingBag, Users, WalletCards } from "lucide-react";
import type { getDashboardData } from "@/app/admin/operations/actions";
import { AdminPageHeader, AdminPanel, EmptyAdminState, StatusPill } from "./admin-ui";
import { Select } from "@/components/ui/select";

type Data = Awaited<ReturnType<typeof getDashboardData>>;

export function DashboardOverview({ data }: { data: Data }) {
  const [marketId, setMarketId] = useState(data.markets[0]?.id ?? "");
  const market = data.markets.find((item) => item.id === marketId);
  const orders = useMemo(() => data.orders.filter((order) => order.marketId === marketId), [data.orders, marketId]);
  const revenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
  const lowStock = data.products.filter((product) => product.stock < 10);
  const money = new Intl.NumberFormat("en", { style: "currency", currency: market?.currency_code ?? "INR", maximumFractionDigits: 0 });
  const stats = [
    { label: `${market?.name ?? "Market"} revenue`, value: money.format(revenue), note: "Cancelled orders excluded", icon: WalletCards },
    { label: "Market orders", value: String(orders.length), note: `${orders.filter((order) => order.status === "processing").length} awaiting action`, icon: PackageCheck },
    { label: "Active products", value: String(data.products.filter((product) => product.is_active).length), note: `${lowStock.length} low-stock products`, icon: ShoppingBag },
    { label: "Customers", value: String(data.customerCount), note: `${data.suspendedCustomerCount} suspended`, icon: Users },
  ];
  return <>
    <AdminPageHeader eyebrow="Daily brief" title="Assalamu alaikum." description="Live storefront activity, kept separate by market and currency." action={<div className="flex flex-wrap gap-3"><label><span className="sr-only">Analytics market</span><Select className="min-h-11" value={marketId} onChange={(event) => setMarketId(event.target.value)}>{data.markets.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.currency_code})</option>)}</Select></label><Link href="/admin/products" className="inline-flex min-h-11 items-center rounded-lg bg-[#123d32] px-4 text-sm font-bold text-white">Manage catalog<ArrowUpRight className="ml-2 h-4 w-4" /></Link></div>} />
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <AdminPanel key={stat.label} className="relative overflow-hidden p-5"><div className="mb-5 flex justify-between"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#6e7b76]">{stat.label}</p><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eee9dc] text-[#8e6b21]"><Icon className="h-4 w-4" /></span></div><p className="font-heading text-3xl text-[#123d32]">{stat.value}</p><p className="mt-2 text-xs text-[#74807b]">{stat.note}</p></AdminPanel>; })}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
      <AdminPanel><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-heading text-xl text-[#123d32]">Recent orders</h2><p className="text-xs text-[#718079]">{market?.name} activity</p></div><Link href="/admin/orders" className="text-sm font-bold text-[#86651f]">View all</Link></div>{orders.length ? <div className="divide-y">{orders.slice(0, 5).map((order) => <div key={order.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div><p className="font-bold">{order.orderNumber}</p><p className="text-xs text-[#74807b]">{order.customerName} · {order.itemCount} items</p></div><StatusPill active={order.status !== "cancelled"} label={order.status} /><p className="font-bold text-[#123d32]">{money.format(order.total)}</p></div>)}</div> : <EmptyAdminState title="No market orders" description="Orders for this selected market will appear here." />}</AdminPanel>
      <AdminPanel><div className="border-b px-5 py-4"><h2 className="font-heading text-xl text-[#123d32]">Stock watch</h2><p className="text-xs text-[#718079]">Products below 10 units</p></div><div className="divide-y">{lowStock.length ? lowStock.slice(0, 8).map((product) => <div key={product.id} className="flex justify-between px-5 py-4"><p className="truncate text-sm font-bold">{product.name}</p><p className="text-sm font-bold text-[#9a4f22]">{product.stock} left</p></div>) : <p className="p-6 text-sm text-[#718079]">All products have healthy stock.</p>}</div></AdminPanel>
    </div>
  </>;
}
