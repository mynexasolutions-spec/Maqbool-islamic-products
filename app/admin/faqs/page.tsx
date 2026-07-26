import { GlobalFaqManager } from "@/components/admin/global-faq-manager";
import { requireAdmin } from "@/lib/admin-authorization";
import type { GlobalFaqRecord } from "@/lib/cloudinary/types";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function AdminFaqsPage() {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("global_faqs").select("*").order("display_order");
  if (error) {
    return <div role="alert" className="rounded-xl border border-[#e9c5bd] bg-[#fff4f1] p-6 text-sm text-[#8d3426]">Global FAQs could not be loaded. Confirm the Supabase migration has been applied, then refresh this page.</div>;
  }
  return <GlobalFaqManager initialFaqs={(data ?? []) as GlobalFaqRecord[]} />;
}
