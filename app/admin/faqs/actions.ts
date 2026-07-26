"use server";

import { revalidatePath } from "next/cache";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import type { MediaActionResult } from "@/lib/cloudinary/types";
import { createAdminClient } from "@/lib/supabase/admin";

function clean(value: string, max: number) {
  return value.trim().slice(0, max);
}

async function db() {
  await requireAdmin();
  return createAdminClient();
}

function failed(error: unknown, message: string): MediaActionResult {
  return {
    ok: false,
    message: error instanceof AdminAuthorizationError
      ? "Your admin session has expired. Please sign in again."
      : message,
  };
}

export async function createGlobalFaq(input: { question: string; answer: string }): Promise<MediaActionResult> {
  try {
    const supabase = await db();
    const question = clean(input.question, 240);
    const answer = clean(input.answer, 2_000);
    if (!question || !answer) return { ok: false, message: "Question and answer are required." };
    const { count } = await supabase.from("global_faqs").select("id", { count: "exact", head: true });
    const { data, error } = await supabase.from("global_faqs").insert({
      question, answer, is_active: true, display_order: count ?? 0,
    }).select("id").single();
    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { ok: true, id: data.id, message: "FAQ created." };
  } catch (error) {
    return failed(error, "Unable to create the FAQ.");
  }
}

export async function updateGlobalFaq(input: {
  id: string;
  question: string;
  answer: string;
  isActive: boolean;
  displayOrder: number;
}): Promise<MediaActionResult> {
  try {
    const supabase = await db();
    const question = clean(input.question, 240);
    const answer = clean(input.answer, 2_000);
    if (!question || !answer) return { ok: false, message: "Question and answer are required." };
    const { error } = await supabase.from("global_faqs").update({
      question,
      answer,
      is_active: input.isActive,
      display_order: Math.max(0, Math.trunc(input.displayOrder)),
    }).eq("id", input.id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { ok: true, message: "FAQ updated." };
  } catch (error) {
    return failed(error, "Unable to update the FAQ.");
  }
}

export async function deleteGlobalFaq(id: string): Promise<MediaActionResult> {
  try {
    const supabase = await db();
    const { error } = await supabase.from("global_faqs").delete().eq("id", id);
    if (error) return { ok: false, message: error.message };
    revalidatePath("/");
    revalidatePath("/admin/faqs");
    return { ok: true, message: "FAQ deleted." };
  } catch (error) {
    return failed(error, "Unable to delete the FAQ.");
  }
}
