export default function ShopLoading() {
  return (
    <main id="main-content" className="site-container py-12" aria-busy="true" aria-label="Loading the Maqbool collection">
      <span className="sr-only" role="status">Loading products</span>
      <div className="mb-9 h-28 animate-pulse rounded-xl bg-cream motion-reduce:animate-none" />
      <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
        <div className="hidden space-y-4 lg:block" aria-hidden="true">
          <div className="h-8 rounded bg-[#eee8d8]" />
          {Array.from({ length: 5 }, (_, index) => <div key={index} className="h-11 rounded bg-cream" />)}
        </div>
        <div>
          <div className="mb-6 h-14 animate-pulse rounded bg-cream motion-reduce:animate-none" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-lg border border-[#eee8d8]">
                <div className="aspect-[4/3] animate-pulse bg-cream motion-reduce:animate-none" />
                <div className="space-y-3 p-4"><div className="h-3 w-24 bg-[#eee8d8]" /><div className="h-6 w-4/5 bg-cream" /><div className="h-5 w-20 bg-[#eee8d8]" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
