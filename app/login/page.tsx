import type { Metadata } from "next";
import { Suspense } from "react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { LoginFlow } from "@/components/customer/login-flow";

export const metadata: Metadata = {
  title: "Sign in - Maqbool Islamic Products",
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="relative overflow-hidden bg-cream py-12 sm:py-20">
        <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full border border-gold/20" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-forest/[.04]" aria-hidden="true" />
        <div className="site-container relative mx-auto max-w-xl">
          <Suspense fallback={<div className="min-h-[560px] animate-pulse rounded-2xl bg-white" aria-label="Loading sign in" />}>
            <LoginFlow />
          </Suspense>
        </div>
      </main>
      <Footer />
    </>
  );
}
