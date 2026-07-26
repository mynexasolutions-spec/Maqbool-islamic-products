import { getCouponData } from "@/app/admin/operations/actions";
import { CouponManager } from "@/components/admin/operations-managers";

export default async function Page() {
  return <CouponManager data={await getCouponData()} />;
}
