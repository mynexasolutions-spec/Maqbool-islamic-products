"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function ShopError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <>
      <Header />
      <main id="main-content" className="site-container grid min-h-[55vh] place-items-center py-16">
        <section className="max-w-xl rounded-xl border border-[#e3dbc7] bg-cream px-6 py-12 text-center" role="alert">
          <AlertTriangle className="mx-auto h-9 w-9 text-gold-dark" aria-hidden="true" />
          <h1 className="mt-4 font-heading text-3xl text-forest">The collection is resting for a moment</h1>
          <p className="mt-3 text-sm leading-6 text-muted">We could not load the catalog right now. Your cart is safe, and you can try again without losing your place.</p>
          <button type="button" onClick={reset} className="mt-7 inline-flex min-h-11 items-center gap-2 rounded bg-forest px-6 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
            <RefreshCw className="h-4 w-4" aria-hidden="true" /> Try again
          </button>
        </section>
      </main>
      <Footer />
    </>
  );
}
