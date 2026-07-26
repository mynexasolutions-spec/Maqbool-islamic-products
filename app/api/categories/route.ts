import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("name,slug")
    .eq("is_active", true)
    .order("display_order")
    .order("name");

  if (error) return NextResponse.json({ categories: [] });
  return NextResponse.json({ categories: data ?? [] });
}
