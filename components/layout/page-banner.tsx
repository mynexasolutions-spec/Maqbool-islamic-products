import Link from "next/link";

export function PageBanner({ title, current }: { title: string; current: string }) {
  return (
    <section className="border-b border-[#ebdcb9] bg-cream py-10 text-center">
      <div className="site-container">
        <h1 className="font-heading text-4xl text-forest">{title}</h1>
        <p className="mt-2 text-sm text-muted">
          <Link href="/" className="font-medium text-forest">
            Home
          </Link>{" "}
          / <span>{current}</span>
        </p>
      </div>
    </section>
  );
}
