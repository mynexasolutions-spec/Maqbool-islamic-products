import { ShippingManager } from "@/components/admin/shipping-manager";
import { getAdminMarkets } from "@/app/admin/markets/actions";

export default async function AdminShippingPage() {
  return <ShippingManager initialMarkets={await getAdminMarkets()} />;
}
