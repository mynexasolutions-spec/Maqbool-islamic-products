import type { Metadata } from "next";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PageBanner } from "@/components/layout/page-banner";
import { ProtectedCustomer } from "@/components/customer/protected-customer";
import { CheckoutForm } from "@/components/customer/checkout-form";

export const metadata: Metadata = { title: "Secure Checkout - Maqbool Islamic Products" };

export default function CheckoutPage() {
  return <><Header /><PageBanner title="Secure Checkout" current="Checkout" /><ProtectedCustomer><main className="bg-cream/40"><CheckoutForm /></main></ProtectedCustomer><Footer /></>;
}
