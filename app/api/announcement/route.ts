import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("announcements").select("message").eq("id", true).eq("is_active", true).maybeSingle();
  if (error) return NextResponse.json({ message: "" }, { status: 200 });
  return NextResponse.json({ message: data?.message ?? "" });
}
