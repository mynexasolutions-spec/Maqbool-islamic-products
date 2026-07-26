import { getAnnouncement } from "@/app/admin/operations/actions";
import { AnnouncementManager } from "@/components/admin/operations-managers";

export default async function Page() {
  return <AnnouncementManager announcement={await getAnnouncement()} />;
}
