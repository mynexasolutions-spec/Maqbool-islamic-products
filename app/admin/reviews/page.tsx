import { getReviews } from "@/app/admin/operations/actions";
import { ReviewManager } from "@/components/admin/operations-managers";

export default async function Page() {
  return <ReviewManager reviews={await getReviews()} />;
}
