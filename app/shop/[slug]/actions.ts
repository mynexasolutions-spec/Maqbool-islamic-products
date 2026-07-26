"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function submitProductReview(input: {
  productId: string; productSlug: string; orderNumber: string; phone: string; rating: number; body: string;
}) {
  try {
    if (!/^[0-9a-f-]{36}$/i.test(input.productId)) throw new Error("Invalid product.");
    const supabase = createAdminClient();
    const { error } = await supabase.rpc("submit_product_review", {
      product_id_input: input.productId,
      order_number_input: input.orderNumber,
      phone_input: input.phone,
      rating_input: Math.trunc(input.rating),
      body_input: input.body,
    });
    if (error) throw new Error(error.message);
    revalidatePath("/admin/reviews");
    revalidatePath(`/shop/${input.productSlug}`);
    return { ok: true as const, message: "Thank you. Your verified review is awaiting approval." };
  } catch (error) {
    return { ok: false as const, error: error instanceof Error ? error.message : "Unable to submit review." };
  }
}
