import { InquiryManager } from "@/components/admin/inquiry-manager";
import { getAdminInquiries } from "./actions";

export default async function AdminInquiriesPage() {
  return <InquiryManager initialInquiries={await getAdminInquiries()} />;
}
