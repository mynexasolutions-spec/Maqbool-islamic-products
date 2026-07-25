import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProtectedCustomer } from "@/components/customer/protected-customer";
import { AccountShell } from "@/components/customer/account-shell";
import { OrderDetail } from "@/components/customer/order-detail";

export default function OrderDetailPage() {
  return <><Header /><ProtectedCustomer><main className="bg-cream/50"><AccountShell><OrderDetail /></AccountShell></main></ProtectedCustomer><Footer /></>;
}
