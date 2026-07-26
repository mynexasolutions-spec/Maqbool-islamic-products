import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/data/products";

const badgeColors = {
  gold: "bg-[#9b722d]",
  green: "bg-forest",
  red: "bg-[#a63f3f]",
};

type ProductCardVisualProps = {
  href: string;
  name: string;
  category: string;
  price: ReactNode;
  oldPrice?: ReactNode;
  image: ReactNode;
  ratingLabel: string;
  ratingText: string;
  reviewText: string;
  badge?: string;
  badgeClassName?: string;
  compact?: boolean;
  actions?: ReactNode;
};

/**
 * Shared visual foundation for homepage and catalog cards.
 * Commerce behavior stays in the catalog adapter so this component remains reusable.
 */
export function ProductCardVisual({
  href,
  name,
  category,
  price,
  oldPrice,
  image,
  ratingLabel,
  ratingText,
  reviewText,
  badge,
  badgeClassName = "bg-forest",
  compact = false,
  actions,
}: ProductCardVisualProps) {
  return (
    <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-lg border border-[#eee8d8] bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(15,56,44,.10)] motion-reduce:transition-none">
      {badge ? (
        <span
          className={`absolute left-3 top-3 z-10 rounded-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white ${badgeClassName}`}
        >
          {badge}
        </span>
      ) : null}
      <Link
        href={href}
        aria-label={`View ${name}`}
        className="flex flex-1 flex-col rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-inset"
      >
        <div className={`relative overflow-hidden bg-cream ${compact ? "aspect-[4/3]" : "aspect-[4/3]"}`}>
          {image}
        </div>
        <div className={`flex flex-1 flex-col ${compact ? "p-3" : "p-4"}`}>
          <p className="truncate text-[10px] font-bold uppercase tracking-[.13em] text-gold-dark">
            {category}
          </p>
          <h2 className={`mt-1.5 line-clamp-2 font-heading leading-snug text-forest ${compact ? "min-h-10 text-sm" : "min-h-11 text-lg"}`}>
            {name}
          </h2>
          <div className="mt-2 flex items-center gap-1" aria-label={ratingLabel}>
            <Star className="h-3.5 w-3.5 fill-[#b77c12] text-[#b77c12]" aria-hidden="true" />
            <span className="text-xs font-bold text-[#59491f]">{ratingText}</span>
            <span className="truncate text-xs text-muted">({reviewText})</span>
          </div>
          <div className={`mt-auto flex flex-wrap items-baseline gap-2 ${compact ? "pt-2" : "pt-3"}`}>
            <span className={`font-bold text-forest ${compact ? "text-base" : "text-lg"}`}>{price}</span>
            {oldPrice ? <span className="text-xs text-muted line-through">{oldPrice}</span> : null}
          </div>
        </div>
      </Link>
      {actions ? <div className="grid grid-cols-2 gap-2 border-t border-[#eee8d8] p-3">{actions}</div> : null}
    </article>
  );
}

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const href = product.href ?? `/shop/${product.slug}`;
  return (
    <ProductCardVisual
      href={href}
      name={product.name}
      category={product.category}
      price={product.price}
      oldPrice={product.oldPrice}
      ratingLabel={`5 out of 5 stars, ${product.reviews} reviews`}
      ratingText="5.0"
      reviewText={product.reviews}
      badge={product.badge}
      badgeClassName={badgeColors[product.badgeTone ?? "gold"]}
      compact={compact}
      image={(
        <Image
          src={product.image}
          alt={product.alt}
          fill
          sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, (max-width: 1279px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      )}
    />
  );
}
