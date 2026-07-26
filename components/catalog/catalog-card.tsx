"use client";

import { useRouter } from "next/navigation";
import { ShoppingBag, Zap } from "lucide-react";
import type { CartItem, Product } from "@/lib/models";
import { formatPrice } from "@/lib/commerce";
import { CatalogImage } from "@/components/catalog/catalog-image";
import { ProductCardVisual } from "@/components/product-card";
import { useCart } from "@/components/providers/cart-provider";
import { useCustomer } from "@/components/providers/customer-provider";
import { useToast } from "@/components/providers/toast-provider";
import { marketHref, type MarketSlug } from "@/lib/markets";

const actionClassName =
  "inline-flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded px-2 text-center text-xs font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none";

export function CatalogCard({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { customer } = useCustomer();
  const { toast } = useToast();
  const marketSlug = (product.marketSlug ?? "in") as MarketSlug;
  const productHref = marketHref(marketSlug, `/shop/${product.slug}`);
  const availableVariants = product.variants.filter((variant) => variant.stock > 0);
  const directlyPurchasable = product.variants.length === 1 ? availableVariants[0] : undefined;
  const unavailable = availableVariants.length === 0;

  const goToProduct = () => router.push(productHref);
  const makeCartItem = (): CartItem | null => {
    if (!directlyPurchasable) return null;
    return {
      id: `${product.id}:${directlyPurchasable.id}`,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: directlyPurchasable.image ?? product.images[0]?.src ?? "",
      variantId: directlyPurchasable.id,
      variantName: `${directlyPurchasable.name}: ${directlyPurchasable.value}`,
      price: directlyPurchasable.price,
      quantity: 1,
      stock: directlyPurchasable.stock,
      marketSlug,
      currencyCode: product.currencyCode,
    };
  };
  const purchase = (buyNow: boolean) => {
    if (unavailable) return;
    if (!directlyPurchasable) {
      goToProduct();
      return;
    }
    const item = makeCartItem();
    if (!item) return;
    addItem(item);
    toast(`${product.name} added to your cart.`);
    if (buyNow) {
      const checkoutHref = marketHref(marketSlug, "/checkout");
      router.push(
        customer
          ? checkoutHref
          : `${marketHref(marketSlug, "/login")}?returnTo=${encodeURIComponent(checkoutHref)}`,
      );
    }
  };

  const actionHint = unavailable
    ? "Out of stock"
    : directlyPurchasable
      ? undefined
      : `Choose an option for ${product.name}`;

  return (
    <ProductCardVisual
      href={productHref}
      name={product.name}
      category={product.category}
      price={formatPrice(product.price, marketSlug)}
      oldPrice={product.originalPrice ? formatPrice(product.originalPrice, marketSlug) : undefined}
      ratingLabel={`${product.rating} out of 5 stars, ${product.reviewCount} reviews`}
      ratingText={String(product.rating)}
      reviewText={product.reviewCount.toLocaleString("en-IN")}
      badge={product.badge}
      image={(
        <CatalogImage
          src={product.images[0]?.src ?? ""}
          alt={product.images[0]?.alt ?? product.name}
          sizes="(max-width: 639px) 100vw, (max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none"
        />
      )}
      actions={(
        <>
          <button
            type="button"
            onClick={() => purchase(false)}
            disabled={unavailable}
            aria-label={unavailable ? `Add ${product.name} to cart — out of stock` : actionHint ?? `Add ${product.name} to cart`}
            className={`${actionClassName} border border-forest bg-white text-forest hover:bg-cream`}
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{unavailable ? "Unavailable" : "Add to cart"}</span>
          </button>
          <button
            type="button"
            onClick={() => purchase(true)}
            disabled={unavailable}
            aria-label={unavailable ? `Buy ${product.name} now — out of stock` : actionHint ?? `Buy ${product.name} now`}
            className={`${actionClassName} bg-forest text-white hover:bg-forest-light`}
          >
            <Zap className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>Buy now</span>
          </button>
        </>
      )}
    />
  );
}
