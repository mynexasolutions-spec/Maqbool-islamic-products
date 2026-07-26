import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const required = ["full_name", "email", "subject", "message"] as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (required.some((field) => typeof body[field] !== "string" || !body[field])) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      full_name: String(body.full_name),
      email: String(body.email),
      phone: typeof body.phone === "string" && body.phone ? body.phone : null,
      order_id: typeof body.order_id === "string" && body.order_id ? body.order_id : null,
      subject: String(body.subject),
      message: String(body.message),
    });

    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Contact submission failed:", error);
    return NextResponse.json({ error: "Unable to submit message." }, { status: 500 });
  }
}
