import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/lib/models";
import { formatPrice } from "@/lib/commerce";
import { CatalogImage } from "@/components/catalog/catalog-image";
import { marketHref, type MarketSlug } from "@/lib/markets";

export function CatalogCard({ product }: { product: Product }) {
  return (
    <article className="group relative overflow-hidden rounded-lg border border-[#eee8d8] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,56,44,.10)]">
      {product.badge ? <span className="absolute left-3 top-3 z-10 rounded-sm bg-forest px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{product.badge}</span> : null}
      <Link href={marketHref((product.marketSlug ?? "in") as MarketSlug, `/shop/${product.slug}`)} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">
        <div className="relative aspect-[4/3] overflow-hidden bg-cream">
          <CatalogImage src={product.images[0]?.src ?? ""} alt={product.images[0]?.alt ?? product.name} sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw" className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" />
        </div>
        <div className="p-4">
          <p className="text-[11px] font-bold uppercase tracking-[.13em] text-gold-dark">{product.category}</p>
          <h2 className="mt-1.5 min-h-11 font-heading text-lg leading-snug text-forest">{product.name}</h2>
          <div className="mt-2 flex items-center gap-1" aria-label={`${product.rating} out of 5 stars, ${product.reviewCount} reviews`}>
            <Star className="h-3.5 w-3.5 fill-[#d6a84c] text-[#d6a84c]" aria-hidden="true" />
            <span className="text-xs font-bold text-[#59491f]">{product.rating}</span>
            <span className="text-xs text-muted">({product.reviewCount.toLocaleString("en-IN")})</span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-bold text-forest">{formatPrice(product.price, (product.marketSlug ?? "in") as MarketSlug)}</span>
            {product.originalPrice ? <span className="text-xs text-muted line-through">{formatPrice(product.originalPrice, (product.marketSlug ?? "in") as MarketSlug)}</span> : null}
          </div>
        </div>
      </Link>
    </article>
  );
}
