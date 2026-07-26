import { getAdminProfile } from "@/app/admin/operations/actions";
import { AdminProfileManager } from "@/components/admin/operations-managers";

export default async function Page() {
  return <AdminProfileManager profile={await getAdminProfile()} />;
}
