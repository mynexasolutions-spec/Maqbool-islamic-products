"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import { createAdminClient } from "@/lib/supabase/admin";

export type InquiryStatus = "new" | "open" | "resolved";

export type AdminInquiry = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  orderId: string | null;
  subject: string;
  message: string;
  status: InquiryStatus;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
};

function failure(error: unknown) {
  return {
    ok: false as const,
    error: error instanceof AdminAuthorizationError
      ? "Your admin session has expired."
      : error instanceof Error ? error.message : "Unable to update the inquiry.",
  };
}

export async function getAdminInquiries(): Promise<AdminInquiry[]> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map((inquiry) => ({
    id: inquiry.id,
    fullName: inquiry.full_name,
    email: inquiry.email,
    phone: inquiry.phone,
    orderId: inquiry.order_id,
    subject: inquiry.subject,
    message: inquiry.message,
    status: inquiry.status ?? "new",
    adminNote: inquiry.admin_note ?? "",
    createdAt: inquiry.created_at,
    updatedAt: inquiry.updated_at ?? inquiry.created_at,
  }));
}

export async function updateInquiry(input: { id: string; status: InquiryStatus; adminNote: string }) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_messages").update({
      status: input.status,
      admin_note: input.adminNote.trim().slice(0, 2000) || null,
    }).eq("id", input.id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/inquiries");
    return { ok: true as const, message: "Inquiry updated." };
  } catch (error) {
    return failure(error);
  }
}

export async function deleteInquiry(id: string) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/inquiries");
    return { ok: true as const, message: "Inquiry deleted." };
  } catch (error) {
    return failure(error);
  }
}
