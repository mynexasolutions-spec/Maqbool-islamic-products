import { OrderManager } from "@/components/admin/order-manager";
import { getAdminOrders } from "./actions";

export default async function AdminOrdersPage() {
  return <OrderManager initialOrders={await getAdminOrders()} />;
}
