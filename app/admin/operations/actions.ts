"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export type ActionResult = { ok: true; message: string } | { ok: false; error: string };

function failure(error: unknown, fallback: string): ActionResult {
  return {
    ok: false,
    error: error instanceof AdminAuthorizationError
      ? "Your admin session has expired."
      : error instanceof Error ? error.message : fallback,
  };
}

async function client() {
  await requireAdmin();
  return createAdminClient();
}

export async function getDashboardData() {
  const supabase = await client();
  const [orders, items, products, variants, customers, markets] = await Promise.all([
    supabase.from("orders").select("*").order("created_at", { ascending: false }),
    supabase.from("order_items").select("order_id"),
    supabase.from("products").select("id,name,is_active"),
    supabase.from("product_variants").select("product_id,stock"),
    supabase.from("customer_profiles").select("id,is_active"),
    supabase.from("markets").select("id,code,name,currency_code").order("display_order"),
  ]);
  const error = [orders, items, products, variants, customers, markets].find((result) => result.error)?.error;
  if (error) throw new Error(error.message);
  return {
    orders: (orders.data ?? []).map((order) => ({
      id: order.id,
      orderNumber: order.order_number,
      customerName: order.customer_name,
      marketId: order.market_id,
      marketCode: order.market_code,
      currencyCode: order.currency_code,
      total: Number(order.total),
      status: order.status,
      createdAt: order.created_at,
      itemCount: (items.data ?? []).filter((item) => item.order_id === order.id).length,
    })),
    products: (products.data ?? []).map((product) => ({
      ...product,
      stock: (variants.data ?? []).filter((variant) => variant.product_id === product.id)
        .reduce((sum, variant) => sum + variant.stock, 0),
    })),
    customerCount: customers.data?.length ?? 0,
    suspendedCustomerCount: customers.data?.filter((item) => !item.is_active).length ?? 0,
    markets: markets.data ?? [],
  };
}

export async function getCustomers() {
  const supabase = await client();
  const [profiles, orders] = await Promise.all([
    supabase.from("customer_profiles").select("*").order("last_order_at", { ascending: false }),
    supabase.from("orders").select("customer_phone,total,currency_code,status"),
  ]);
  if (profiles.error || orders.error) throw new Error(profiles.error?.message ?? orders.error?.message);
  return (profiles.data ?? []).map((profile) => {
    const digits = profile.normalized_phone;
    const related = (orders.data ?? []).filter((order) => order.customer_phone.replace(/\D/g, "") === digits);
    const spendByCurrency = related.filter((order) => order.status !== "cancelled").reduce<Record<string, number>>((totals, order) => {
      totals[order.currency_code] = (totals[order.currency_code] ?? 0) + Number(order.total);
      return totals;
    }, {});
    return { ...profile, orderCount: related.length, spendByCurrency };
  });
}

export async function setCustomerActive(id: string, isActive: boolean, reason = ""): Promise<ActionResult> {
  try {
    const supabase = await client();
    const { error } = await supabase.from("customer_profiles").update({
      is_active: isActive,
      suspension_reason: isActive ? null : reason.trim().slice(0, 240) || "Suspended by administrator",
    }).eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/customers");
    revalidatePath("/admin");
    return { ok: true, message: isActive ? "Customer reactivated." : "Customer suspended." };
  } catch (error) { return failure(error, "Unable to update customer."); }
}

export async function getReviews() {
  const supabase = await client();
  const [reviews, products] = await Promise.all([
    supabase.from("product_reviews").select("*").order("created_at", { ascending: false }),
    supabase.from("products").select("id,name,slug"),
  ]);
  if (reviews.error || products.error) throw new Error(reviews.error?.message ?? products.error?.message);
  return (reviews.data ?? []).map((review) => ({
    ...review,
    productName: products.data?.find((product) => product.id === review.product_id)?.name ?? "Deleted product",
  }));
}

export async function moderateReview(id: string, status: "approved" | "rejected"): Promise<ActionResult> {
  try {
    const supabase = await client();
    const { data, error } = await supabase.from("product_reviews").update({ status }).eq("id", id).select("product_id").single();
    if (error) throw new Error(error.message);
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    revalidatePath("/shop");
    if (data?.product_id) revalidatePath(`/shop`);
    return { ok: true, message: status === "approved" ? "Review published." : "Review rejected." };
  } catch (error) { return failure(error, "Unable to moderate review."); }
}

export async function deleteReview(id: string): Promise<ActionResult> {
  try {
    const supabase = await client();
    const { error } = await supabase.from("product_reviews").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/reviews");
    revalidatePath("/");
    revalidatePath("/shop");
    return { ok: true, message: "Review deleted." };
  } catch (error) { return failure(error, "Unable to delete review."); }
}

export async function getCouponData() {
  const supabase = await client();
  const [coupons, markets] = await Promise.all([
    supabase.from("coupons").select("*").order("created_at", { ascending: false }),
    supabase.from("markets").select("id,code,name,currency_code").order("display_order"),
  ]);
  if (coupons.error || markets.error) throw new Error(coupons.error?.message ?? markets.error?.message);
  return { coupons: coupons.data ?? [], markets: markets.data ?? [] };
}

export async function saveCoupon(input: {
  id?: string; marketId: string; code: string; discountType: "percentage" | "flat";
  discountValue: number; minimumPurchase: number; startsAt?: string; endsAt?: string;
  usageLimit?: number | null; isActive: boolean;
}): Promise<ActionResult> {
  try {
    if (!input.code.trim()) throw new Error("Enter a coupon code.");
    if (!Number.isFinite(input.discountValue) || input.discountValue <= 0) throw new Error("Discount must be greater than zero.");
    if (input.discountType === "percentage" && input.discountValue > 100) throw new Error("Percentage cannot exceed 100.");
    const supabase = await client();
    const values = {
      market_id: input.marketId,
      code: input.code.trim().toUpperCase().replace(/\s+/g, ""),
      discount_type: input.discountType,
      discount_value: input.discountValue,
      minimum_purchase: Math.max(0, input.minimumPurchase),
      starts_at: input.startsAt || null,
      ends_at: input.endsAt || null,
      usage_limit: input.usageLimit && input.usageLimit > 0 ? Math.trunc(input.usageLimit) : null,
      is_active: input.isActive,
    };
    const result = input.id
      ? await supabase.from("coupons").update(values).eq("id", input.id)
      : await supabase.from("coupons").insert(values);
    if (result.error) throw new Error(result.error.message);
    revalidatePath("/admin/coupons");
    return { ok: true, message: input.id ? "Coupon updated." : "Coupon created." };
  } catch (error) { return failure(error, "Unable to save coupon."); }
}

export async function deleteCoupon(id: string): Promise<ActionResult> {
  try {
    const supabase = await client();
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/coupons");
    return { ok: true, message: "Coupon deleted." };
  } catch (error) { return failure(error, "Unable to delete coupon."); }
}

export async function getAnnouncement() {
  const supabase = await client();
  const { data, error } = await supabase.from("announcements").select("*").eq("id", true).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? { id: true, message: "", is_active: false };
}

export async function saveAnnouncement(message: string, isActive: boolean): Promise<ActionResult> {
  try {
    if (isActive && !message.trim()) throw new Error("Enter an announcement before publishing.");
    const supabase = await client();
    const { error } = await supabase.from("announcements").upsert({
      id: true, message: message.trim().slice(0, 240), is_active: isActive,
    }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/announcements");
    revalidatePath("/");
    return { ok: true, message: "Announcement saved." };
  } catch (error) { return failure(error, "Unable to save announcement."); }
}

export async function getAdminProfile() {
  const supabase = await client();
  const { data, error } = await supabase.from("admin_profiles").select("*").eq("id", true).maybeSingle();
  if (error) throw new Error(error.message);
  return data ?? { id: true, full_name: "Maqbool Administrator", email: null, phone: null };
}

export async function saveAdminProfile(input: { fullName: string; email: string; phone: string }): Promise<ActionResult> {
  try {
    if (!input.fullName.trim()) throw new Error("Enter the administrator name.");
    if (input.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) throw new Error("Enter a valid email.");
    const supabase = await client();
    const { error } = await supabase.from("admin_profiles").upsert({
      id: true,
      full_name: input.fullName.trim().slice(0, 120),
      email: input.email.trim() || null,
      phone: input.phone.trim() || null,
    }, { onConflict: "id" });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/settings");
    return { ok: true, message: "Admin profile saved. Login credentials were not changed." };
  } catch (error) { return failure(error, "Unable to save admin profile."); }
}
