import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import type { Product } from "@/data/products";

const badgeColors = {
  gold: "bg-[#c99a3c]",
  green: "bg-forest-light",
  red: "bg-[#cc4b4b]",
};

export function ProductCard({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  return (
    <article className="group relative rounded-lg border border-[#f0ebde] bg-white p-3 transition-shadow hover:shadow-[0_10px_25px_rgba(0,0,0,.05)]">
      {product.badge && (
        <span
          className={`absolute left-3 top-3 z-10 rounded-[3px] px-2 py-[3px] text-[0.65rem] font-bold uppercase text-white ${
            badgeColors[product.badgeTone ?? "gold"]
          }`}
        >
          {product.badge}
        </span>
      )}
      <Link href={product.href ?? `/shop/${product.slug}`} className="block">
        <div className={`relative overflow-hidden rounded ${compact ? "h-44" : "h-[220px]"}`}>
          <Image
            src={product.image}
            alt={product.alt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
        <p className="mt-3 text-[0.7rem] font-semibold uppercase tracking-wide text-gold">
          {product.category}
        </p>
        <h2 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold text-[#2b2b2b]">
          {product.name}
        </h2>
        <div className="mt-1.5 flex items-center gap-1 text-[0.7rem] text-[#e0aa3e]">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star key={index} className="h-3 w-3 fill-current" />
          ))}
          <span className="ml-1 text-[0.65rem] text-muted">({product.reviews})</span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <span className="font-bold text-forest">{product.price}</span>
          {product.oldPrice && (
            <span className="text-xs text-muted line-through">{product.oldPrice}</span>
          )}
        </div>
      </Link>
    </article>
  );
}
