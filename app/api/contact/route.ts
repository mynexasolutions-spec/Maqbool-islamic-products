import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const required = ["full_name", "email", "subject", "message"] as const;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    if (required.some((field) => typeof body[field] !== "string" || !String(body[field]).trim())) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }
    const email = String(body.email).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.from("contact_messages").insert({
      full_name: String(body.full_name).trim().slice(0, 120),
      email: email.slice(0, 320),
      phone: typeof body.phone === "string" && body.phone.trim() ? body.phone.trim().slice(0, 32) : null,
      order_id: typeof body.order_id === "string" && body.order_id.trim() ? body.order_id.trim().slice(0, 80) : null,
      subject: String(body.subject).trim().slice(0, 120),
      message: String(body.message).trim().slice(0, 5000),
    });

    if (error) throw error;
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Contact submission failed:", error);
    return NextResponse.json({ error: "Unable to submit message." }, { status: 500 });
  }
}
