"use client";

import Link from "next/link";
import { ArrowUpRight, IndianRupee, PackageCheck, ShoppingBag, Users } from "lucide-react";
import { AdminPageHeader, AdminPanel, StatusPill } from "@/components/admin/admin-ui";
import { useAdminStore } from "@/components/admin/admin-store";

const currency = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export default function AdminDashboardPage() {
  const { products, orders, customers } = useAdminStore();
  const revenue = orders.filter((order) => order.status !== "cancelled").reduce((sum, order) => sum + order.total, 0);
  const lowStock = products.filter((product) => product.variants.reduce((sum, variant) => sum + variant.stock, 0) < 10);
  const stats = [
    { label: "Demo revenue", value: currency.format(revenue), note: "Across saved orders", icon: IndianRupee },
    { label: "Orders", value: String(orders.length), note: `${orders.filter((order) => order.status === "processing").length} awaiting action`, icon: PackageCheck },
    { label: "Active products", value: String(products.filter((product) => product.active).length), note: `${lowStock.length} low-stock item${lowStock.length === 1 ? "" : "s"}`, icon: ShoppingBag },
    { label: "Customers", value: String(customers.length), note: "Read-only demo records", icon: Users },
  ];

  return (
    <>
      <AdminPageHeader eyebrow="Daily brief" title="Assalamu alaikum." description="Here is the pulse of the Maqbool storefront today." action={<Link href="/admin/products" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#123d32] px-4 text-sm font-bold text-white hover:bg-[#1a5445] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]">Manage catalog <ArrowUpRight className="ml-2 h-4 w-4" /></Link>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <AdminPanel key={stat.label} className="relative overflow-hidden p-5">
              <div className="absolute -right-5 -top-5 h-20 w-20 rounded-full bg-[#d5b56d]/10" aria-hidden="true" />
              <div className="mb-5 flex items-start justify-between"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#6e7b76]">{stat.label}</p><span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eee9dc] text-[#8e6b21]"><Icon className="h-4 w-4" /></span></div>
              <p className="font-heading text-3xl text-[#123d32]">{stat.value}</p>
              <p className="mt-2 text-xs text-[#74807b]">{stat.note}</p>
            </AdminPanel>
          );
        })}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.55fr_1fr]">
        <AdminPanel>
          <div className="flex items-center justify-between border-b border-[#e8e3d8] px-5 py-4"><div><h2 className="font-heading text-xl text-[#123d32]">Recent orders</h2><p className="text-xs text-[#718079]">Latest demo checkout activity</p></div><Link href="/admin/orders" className="text-sm font-bold text-[#86651f] hover:underline">View all</Link></div>
          <div className="divide-y divide-[#eee9df]">
            {orders.slice(0, 5).map((order) => (
              <div key={order.id} className="grid gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div><p className="font-bold text-[#263d35]">{order.id}</p><p className="text-xs text-[#74807b]">{order.customer.name} · {order.items.length} item{order.items.length === 1 ? "" : "s"}</p></div>
                <StatusPill active={order.status !== "cancelled"} label={order.status} />
                <p className="font-bold text-[#123d32] sm:text-right">{currency.format(order.total)}</p>
              </div>
            ))}
          </div>
        </AdminPanel>
        <AdminPanel>
          <div className="border-b border-[#e8e3d8] px-5 py-4"><h2 className="font-heading text-xl text-[#123d32]">Stock watch</h2><p className="text-xs text-[#718079]">Products nearing replenishment</p></div>
          <div className="divide-y divide-[#eee9df]">
            {lowStock.length ? lowStock.map((product) => (
              <div key={product.id} className="flex items-center gap-3 px-5 py-4">
                <div className="h-10 w-1 rounded-full bg-[#c98b42]" aria-hidden="true" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-[#263d35]">{product.name}</p><p className="text-xs text-[#74807b]">{product.category}</p></div>
                <p className="text-sm font-bold text-[#9a4f22]">{product.variants.reduce((sum, variant) => sum + variant.stock, 0)} left</p>
              </div>
            )) : <p className="p-6 text-sm text-[#718079]">All products have healthy stock.</p>}
          </div>
        </AdminPanel>
      </div>
    </>
  );
}
