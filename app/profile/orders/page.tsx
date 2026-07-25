import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProtectedCustomer } from "@/components/customer/protected-customer";
import { AccountShell } from "@/components/customer/account-shell";
import { OrderList } from "@/components/customer/order-list";

export default function OrdersPage() {
  return <><Header /><ProtectedCustomer><main className="bg-cream/50"><AccountShell><OrderList /></AccountShell></main></ProtectedCustomer><Footer /></>;
}
