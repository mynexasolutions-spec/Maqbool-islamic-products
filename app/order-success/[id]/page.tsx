import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProtectedCustomer } from "@/components/customer/protected-customer";
import { OrderSuccess } from "@/components/customer/order-success";

export default function OrderSuccessPage() {
  return <><Header /><ProtectedCustomer><OrderSuccess /></ProtectedCustomer><Footer /></>;
}
