"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Json } from "@/lib/database.types";
import type { OrderStatus } from "@/lib/models";

export type AdminMarketOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  marketCode: string;
  currencyCode: string;
  customerName: string;
  customerPhone: string;
  address: Json;
  subtotal: number;
  discount: number;
  shipping: number;
  taxLabel: string;
  tax: number;
  codFee: number;
  total: number;
  paymentMethod: "cod" | "online";
  paymentStatus: string;
  status: OrderStatus;
  items: Array<{ id: string; name: string; variantName: string; quantity: number; unitPrice: number; lineTotal: number }>;
};

export async function getAdminOrders(): Promise<AdminMarketOrder[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const [orders, items] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("order_items").select("*"),
  ]);
  if (orders.error || items.error) throw new Error(orders.error?.message ?? items.error?.message);
  return (orders.data ?? []).map((order) => ({
    id: order.id,
    orderNumber: order.order_number,
    createdAt: order.created_at,
    marketCode: order.market_code,
    currencyCode: order.currency_code,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    address: order.delivery_address,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    shipping: Number(order.shipping),
    taxLabel: order.tax_label,
    tax: Number(order.tax),
    codFee: Number(order.cod_fee),
    total: Number(order.total),
    paymentMethod: order.payment_method,
    paymentStatus: order.payment_status,
    status: order.status,
    items: (items.data ?? []).filter((item) => item.order_id === order.id).map((item) => ({
      id: item.id,
      name: item.product_name,
      variantName: item.variant_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      lineTotal: Number(item.line_total),
    })),
  }));
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("set_market_order_status", { order_id_input: id, status_input: status });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { ok: true as const, message: "Order status updated." };
  } catch (error) {
    return { ok: false as const, error: error instanceof AdminAuthorizationError ? "Your admin session has expired." : error instanceof Error ? error.message : "Unable to update the order." };
  }
}
