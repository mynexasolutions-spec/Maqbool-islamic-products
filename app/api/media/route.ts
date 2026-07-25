import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A file is required." }, { status: 400 });
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage
      .from("product-media")
      .upload(objectPath, file, { contentType: file.type, upsert: false });
    if (error) throw error;

    const { data } = supabase.storage.from("product-media").getPublicUrl(objectPath);
    return NextResponse.json({ path: objectPath, url: data.publicUrl }, { status: 201 });
  } catch (error) {
    console.error("Media upload failed:", error);
    return NextResponse.json({ error: "Unable to upload media." }, { status: 500 });
  }
}
