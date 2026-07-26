"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Search } from "lucide-react";
import { updateOrderStatus, type AdminMarketOrder } from "@/app/admin/orders/actions";
import type { OrderStatus } from "@/lib/models";
import { AdminPageHeader, AdminPanel, EmptyAdminState, StatusPill } from "./admin-ui";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { formatAdminDate, formatAdminDateTime } from "@/lib/date-format";

const statuses: OrderStatus[] = ["confirmed", "processing", "shipped", "delivered", "cancelled"];
const money = (value: number, currency: string) =>
  new Intl.NumberFormat("en", { style: "currency", currency }).format(value);

export function OrderManager({ initialOrders }: { initialOrders: AdminMarketOrder[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<AdminMarketOrder | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const filtered = useMemo(
    () => initialOrders.filter((order) =>
      `${order.orderNumber} ${order.customerName} ${order.customerPhone} ${order.marketCode}`
        .toLowerCase()
        .includes(query.toLowerCase())
      && (status === "all" || order.status === status)),
    [initialOrders, query, status],
  );

  const changeStatus = (order: AdminMarketOrder, next: OrderStatus) => startTransition(async () => {
    setError("");
    const result = await updateOrderStatus(order.id, next);
    if (!result.ok) setError(result.error);
    else {
      setMessage(`${order.orderNumber} changed to ${next}.`);
      setSelected(null);
      router.refresh();
    }
  });

  return (
    <>
      <AdminPageHeader eyebrow="Fulfilment" title="Orders" description="Review persisted orders and their complete fulfilment timeline." />
      <p className="mb-4 min-h-5 text-sm font-semibold text-[#176342]" role="status">{message}</p>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      <AdminPanel>
        <div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_220px]">
          <label className="relative">
            <span className="sr-only">Search orders</span>
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#718079]" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Order, customer, phone or market…" />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <Select className="w-full" value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="all">All statuses</option>
              {statuses.map((item) => <option key={item}>{item}</option>)}
            </Select>
          </label>
        </div>
        {filtered.length ? (
          <Table>
            <thead className="bg-[#f8f6f0] text-xs uppercase text-[#69766f]">
              <tr>
                <th className="px-5 py-3">Order</th><th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Market</th><th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th>
                <th className="px-5 py-3 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td className="px-5 py-4"><p className="font-bold">{order.orderNumber}</p><p className="text-xs text-[#74807b]">{formatAdminDate(order.createdAt)}</p></td>
                  <td className="px-4 py-4"><p className="font-semibold">{order.customerName}</p><p className="text-xs">{order.customerPhone}</p></td>
                  <td className="px-4 py-4 font-bold">{order.marketCode}</td>
                  <td className="px-4 py-4 font-bold">{money(order.total, order.currencyCode)}</td>
                  <td className="px-4 py-4 text-xs uppercase">{order.paymentMethod} · {order.paymentStatus}</td>
                  <td className="px-4 py-4"><StatusPill active={order.status !== "cancelled"} label={order.status} /></td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => setSelected(order)} className="min-h-11 min-w-11 rounded-lg hover:bg-[#e8f0ec]" aria-label={`View ${order.orderNumber}`}>
                      <Eye className="mx-auto h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : <EmptyAdminState title="No orders found" description="New checkout orders will appear here." />}
      </AdminPanel>
      <Dialog open={Boolean(selected)} onClose={() => !pending && setSelected(null)} title={selected ? `Order ${selected.orderNumber}` : "Order"}>
        {selected && <OrderDetail order={selected} pending={pending} onStatus={(next) => changeStatus(selected, next)} />}
      </Dialog>
    </>
  );
}

function OrderDetail({ order, pending, onStatus }: {
  order: AdminMarketOrder;
  pending: boolean;
  onStatus: (status: OrderStatus) => void;
}) {
  const address = order.address && typeof order.address === "object" && !Array.isArray(order.address)
    ? order.address as Record<string, unknown>
    : {};
  return (
    <div className="space-y-5 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-[#f4f1e8] p-4">
        <div><p className="text-xs text-[#6b7872]">Placed in {order.marketCode}</p><p className="font-bold">{formatAdminDateTime(order.createdAt)}</p></div>
        <Select aria-label={`Status for ${order.orderNumber}`} value={order.status} disabled={pending || order.status === "cancelled"} onChange={(event) => onStatus(event.target.value as OrderStatus)}>
          {statuses.map((item) => <option key={item}>{item}</option>)}
        </Select>
      </div>
      <section>
        <h3 className="mb-3 font-bold text-[#123d32]">Order timeline</h3>
        <ol className="space-y-3 border-l-2 border-[#d9cfb8] pl-5">
          {order.events.map((event) => (
            <li key={event.id} className="relative">
              <span className="absolute -left-[27px] top-1 h-3 w-3 rounded-full border-2 border-white bg-[#176342]" aria-hidden="true" />
              <p className="font-bold capitalize">{event.status}</p>
              <time dateTime={event.createdAt} className="text-xs text-[#718079]">{formatAdminDateTime(event.createdAt)}</time>
              {event.note && <p className="text-xs">{event.note}</p>}
            </li>
          ))}
        </ol>
      </section>
      <section>
        <h3 className="mb-2 font-bold text-[#123d32]">Items</h3>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between border-b py-3">
            <div><p className="font-semibold">{item.name}</p><p className="text-xs text-[#74807b]">{item.variantName} × {item.quantity}</p></div>
            <p className="font-bold">{money(item.lineTotal, order.currencyCode)}</p>
          </div>
        ))}
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><h3 className="font-bold text-[#123d32]">Customer</h3><p>{order.customerName}</p><p>{order.customerPhone}</p></div>
        <div><h3 className="font-bold text-[#123d32]">Ship to</h3><p>{String(address.line1 ?? "")}{address.line2 ? `, ${String(address.line2)}` : ""}</p><p>{String(address.city ?? "")}, {String(address.state ?? "")} {String(address.pincode ?? "")}</p></div>
      </div>
      <dl className="space-y-2 rounded-lg bg-[#f8f6f0] p-4">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{money(order.subtotal, order.currencyCode)}</dd></div>
        <div className="flex justify-between"><dt>Discount</dt><dd>−{money(order.discount, order.currencyCode)}</dd></div>
        <div className="flex justify-between"><dt>Shipping</dt><dd>{money(order.shipping, order.currencyCode)}</dd></div>
        <div className="flex justify-between"><dt>{order.taxLabel}</dt><dd>{money(order.tax, order.currencyCode)}</dd></div>
        <div className="flex justify-between"><dt>COD fee</dt><dd>{money(order.codFee, order.currencyCode)}</dd></div>
        <div className="flex justify-between border-t pt-2 font-bold text-[#123d32]"><dt>Total</dt><dd>{money(order.total, order.currencyCode)}</dd></div>
      </dl>
    </div>
  );
}
