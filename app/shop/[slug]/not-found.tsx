import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";

export default function ProductNotFound() {
  return (
    <>
      <Header />
      <main id="main-content" className="site-container grid min-h-[55vh] place-items-center py-16">
        <section className="max-w-xl text-center">
          <PackageSearch className="mx-auto h-11 w-11 text-gold-dark" aria-hidden="true" />
          <p className="mt-5 text-xs font-bold uppercase tracking-[.16em] text-gold-dark">Product unavailable</p>
          <h1 className="mt-2 font-heading text-4xl text-forest">This item is no longer in the collection</h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-muted">It may have sold out or moved. Browse the current Maqbool collection to find another meaningful piece.</p>
          <Link href="/shop" className="mt-7 inline-flex min-h-11 items-center rounded bg-forest px-6 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">Browse all products</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
