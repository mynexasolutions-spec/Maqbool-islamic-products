"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, MapPin, Minus, Plus, Share2, ShieldCheck, Star, Truck, X, ZoomIn } from "lucide-react";
import type { CartItem, Product } from "@/lib/models";
import { formatPrice } from "@/lib/commerce";
import { useCart } from "@/components/providers/cart-provider";
import { useToast } from "@/components/providers/toast-provider";
import { CatalogImage } from "@/components/catalog/catalog-image";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { marketHref, type MarketSlug } from "@/lib/markets";
import { ProductReviews } from "@/components/catalog/product-reviews";

export function ProductDetailView({ product, related }: { product: Product; related: Product[] }) {
  const marketSlug = (product.marketSlug ?? "in") as MarketSlug;
  const router = useRouter();
  const { addItem } = useCart();
  const { toast } = useToast();
  const firstAvailable = product.variants.find((variant) => variant.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [imageIndex, setImageIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [pincode, setPincode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const closeZoomRef = useRef<HTMLButtonElement>(null);
  const zoomTriggerRef = useRef<HTMLButtonElement>(null);
  const variant = product.variants.find((item) => item.id === variantId) ?? firstAvailable;
  const stock = variant?.stock ?? 0;

  useEffect(() => setQuantity((current) => Math.max(1, Math.min(current, stock || 1))), [stock]);
  useEffect(() => {
    if (!zoomOpen) return;
    closeZoomRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setZoomOpen(false);
      if (event.key === "Tab") {
        event.preventDefault();
        closeZoomRef.current?.focus();
      }
    };
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", close);
      zoomTriggerRef.current?.focus();
    };
  }, [zoomOpen]);

  const cartItem = (): CartItem => ({
    id: `${product.id}:${variant?.id ?? "default"}`,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    image: variant?.image ?? product.images[0]?.src ?? "",
    variantId: variant?.id ?? "default",
    variantName: variant ? `${variant.name}: ${variant.value}` : "Standard",
    price: variant?.price ?? product.price,
    quantity,
    stock,
    marketSlug,
    currencyCode: product.currencyCode ?? "INR",
  });
  const add = (buyNow = false) => {
    if (!variant || stock < 1) {
      toast("Please choose an available option.");
      return;
    }
    addItem(cartItem());
    toast(`${product.name} added to your cart.`);
    if (buyNow) router.push(marketHref(marketSlug, "/checkout"));
  };
  const checkDelivery = () => {
    if (marketSlug === "in" && !/^\d{6}$/.test(pincode)) {
      setDeliveryMessage("Enter a valid 6-digit Indian pincode.");
      return;
    }
    if (marketSlug !== "in" && pincode.trim().length < 3) {
      setDeliveryMessage("Enter a valid local postal code.");
      return;
    }
    const days = 3 + (Number(pincode.at(-1)) % 4);
    setDeliveryMessage(`Delivery is available. Estimated in ${days}–${days + 1} business days.`);
  };
  const share = async () => {
    const data = { title: product.name, text: `See ${product.name} at Maqbool Islamic Products`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else {
        await navigator.clipboard.writeText(window.location.href);
        toast("Product link copied.");
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast("Sharing is unavailable on this device.");
    }
  };

  return (
    <main id="main-content">
      <div className="border-b border-[#ece5d3] bg-cream">
        <nav aria-label="Breadcrumb" className="site-container flex min-h-12 items-center gap-2 overflow-hidden text-xs text-muted">
          <Link href={marketHref(marketSlug, "/")} className="hover:text-forest">Home</Link><span aria-hidden="true">/</span>
          <Link href={marketHref(marketSlug, "/shop")} className="hover:text-forest">Shop</Link><span aria-hidden="true">/</span>
          <span className="truncate text-forest" aria-current="page">{product.name}</span>
        </nav>
      </div>
      <section className="site-container grid gap-10 py-10 lg:grid-cols-[1.02fr_.98fr] lg:py-16">
        <div>
          <button ref={zoomTriggerRef} type="button" onClick={() => setZoomOpen(true)} disabled={!product.images.length} className="group relative block aspect-square w-full overflow-hidden rounded-xl border border-[#e9e0cb] bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold disabled:cursor-default" aria-label={product.images.length ? `Zoom image: ${product.images[imageIndex]?.alt ?? product.name}` : `${product.name} image unavailable`}>
            <CatalogImage src={product.images[imageIndex]?.src ?? ""} alt={product.images[imageIndex]?.alt ?? product.name} sizes="(max-width: 1024px) 100vw, 50vw" priority className="object-cover transition duration-500 group-hover:scale-[1.02] motion-reduce:transition-none" />
            {product.images.length ? <span className="absolute bottom-4 right-4 flex h-11 items-center gap-2 rounded-full bg-white/95 px-4 text-xs font-semibold text-forest shadow-lg"><ZoomIn className="h-4 w-4" aria-hidden="true" /> Zoom</span> : null}
          </button>
          {product.images.length > 1 ? (
            <div className="mt-3 grid grid-cols-4 gap-3" aria-label="Product images">
              {product.images.map((image, index) => (
                <button key={image.id} type="button" onClick={() => setImageIndex(index)} aria-label={`View image ${index + 1}: ${image.alt}`} aria-pressed={imageIndex === index} className={`relative aspect-square overflow-hidden rounded-md border-2 bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${imageIndex === index ? "border-forest" : "border-transparent"}`}>
                  <CatalogImage src={image.src} alt="" sizes="120px" className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="lg:py-2">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-gold-dark">{product.category}</p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <h1 className="font-heading text-3xl leading-tight text-forest sm:text-4xl">{product.name}</h1>
            <button type="button" onClick={share} aria-label="Share this product" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#d8d0bc] text-forest hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><Share2 className="h-4 w-4" /></button>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm" aria-label={`${product.rating} out of 5 stars from ${product.reviewCount} reviews`}>
            <span className="flex text-[#bd861e]" aria-hidden="true">{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-4 w-4 ${index < Math.round(product.rating) ? "fill-current" : ""}`} />)}</span>
            <strong>{product.rating}</strong><a href="#reviews" className="text-muted underline-offset-2 hover:underline">{product.reviewCount.toLocaleString("en-IN")} reviews</a>
          </div>
          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-forest">{formatPrice(variant?.price ?? product.price, marketSlug)}</span>
            {variant?.originalPrice ? <span className="text-base text-muted line-through">{formatPrice(variant.originalPrice, marketSlug)}</span> : null}
            {variant?.originalPrice ? <span className="rounded bg-[#e7f0e9] px-2 py-1 text-xs font-bold text-forest">{Math.round((1 - variant.price / variant.originalPrice) * 100)}% off</span> : null}
          </div>
          <p className="mt-5 text-sm leading-7 text-muted">{product.description}</p>
          <div className="my-6 h-px bg-[#ece5d3]" />
          {product.variants.length ? (
            <fieldset>
              <legend className="mb-3 text-sm font-bold text-forest">{product.variants[0].name}</legend>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((option) => (
                  <button key={option.id} type="button" onClick={() => option.stock && setVariantId(option.id)} disabled={!option.stock} aria-pressed={variantId === option.id} className={`relative min-h-11 rounded border px-4 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold ${variantId === option.id ? "border-forest bg-forest text-white" : "border-[#d4ccb8] bg-white text-forest"} disabled:cursor-not-allowed disabled:opacity-45`}>
                    <span className="flex items-center gap-2">{option.color ? <span className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ backgroundColor: option.color }} aria-hidden="true" /> : null}{option.value}</span>
                    {!option.stock ? <span className="sr-only"> — out of stock</span> : null}
                  </button>
                ))}
              </div>
            </fieldset>
          ) : null}
          <p className={`mt-3 text-xs font-semibold ${stock <= 5 ? "text-[#9a4d27]" : "text-forest-light"}`} role="status">
            {stock === 0 ? "Currently out of stock" : stock <= 5 ? `Only ${stock} left — order soon` : <><Check className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" /> In stock</>}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <div className="flex min-h-12 items-center rounded border border-[#d4ccb8]" aria-label="Quantity selector">
              <button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} disabled={quantity <= 1} aria-label="Decrease quantity" className="flex h-12 w-11 items-center justify-center text-forest disabled:opacity-35"><Minus className="h-4 w-4" /></button>
              <output className="min-w-9 text-center text-sm font-bold" aria-live="polite">{quantity}</output>
              <button type="button" onClick={() => setQuantity((value) => Math.min(stock, value + 1))} disabled={quantity >= stock} aria-label="Increase quantity" className="flex h-12 w-11 items-center justify-center text-forest disabled:opacity-35"><Plus className="h-4 w-4" /></button>
            </div>
            <button type="button" onClick={() => add()} disabled={!stock} className="min-h-12 flex-1 rounded border-2 border-forest px-6 text-sm font-bold text-forest transition hover:bg-forest hover:text-white disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2">Add to cart</button>
            <button type="button" onClick={() => add(true)} disabled={!stock} className="min-h-12 w-full rounded bg-forest px-6 text-sm font-bold text-white transition hover:bg-forest-light disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 sm:w-auto">Buy it now</button>
          </div>
          <div className="mt-7 rounded-lg border border-[#e3dbc7] bg-cream p-4">
            <label htmlFor="delivery-pincode" className="flex items-center gap-2 text-sm font-bold text-forest"><MapPin className="h-4 w-4 text-gold-dark" /> Check delivery</label>
            <div className="mt-2 flex gap-2">
              <input id="delivery-pincode" value={pincode} onChange={(event) => setPincode(event.target.value.slice(0, 12))} autoComplete="postal-code" placeholder={marketSlug === "in" ? "6-digit pincode" : "Postal code"} className="min-h-11 min-w-0 flex-1 rounded border border-[#cfc6b1] bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-gold" aria-describedby="delivery-result" />
              <button type="button" onClick={checkDelivery} className="min-h-11 rounded bg-forest px-4 text-sm font-semibold text-white">Check</button>
            </div>
            <p id="delivery-result" role="status" className="mt-2 min-h-5 text-xs text-muted">{deliveryMessage}</p>
          </div>
          <div className="mt-5 grid gap-3 text-xs text-muted sm:grid-cols-2">
            <p className="flex items-center gap-2"><Truck className="h-5 w-5 text-gold-dark" /> Shipping calculated for your market</p>
            <p className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-gold-dark" /> Secure checkout & easy returns</p>
          </div>
        </div>
      </section>
      <section className="border-y border-[#e7dfcb] bg-cream py-14">
        <div className="site-container grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="font-heading text-2xl text-forest">Product details</h2>
            {Object.keys(product.specifications).length ? <dl className="mt-5 divide-y divide-[#e2d9c4] border-y border-[#e2d9c4]">
              {Object.entries(product.specifications).map(([term, value]) => <div key={term} className="grid grid-cols-[130px_1fr] gap-4 py-3 text-sm"><dt className="font-semibold text-forest">{term.replace("BeadSize", "Bead size")}</dt><dd className="text-muted">{value}</dd></div>)}
            </dl> : <p className="mt-5 text-sm leading-6 text-muted">Detailed product information will be available soon.</p>}
          </div>
          <div>
            <h2 className="font-heading text-2xl text-forest">Questions, answered</h2>
            {product.faqs.length ? <div className="mt-5 divide-y divide-[#e2d9c4] border-y border-[#e2d9c4]">
              {product.faqs.map((faq) => <details key={faq.question} className="group py-1"><summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 py-2 text-sm font-semibold text-forest focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{faq.question}<ChevronDown className="h-4 w-4 shrink-0 transition group-open:rotate-180" /></summary><p className="pb-4 pr-8 text-sm leading-6 text-muted">{faq.answer}</p></details>)}
            </div> : <p className="mt-5 text-sm leading-6 text-muted">No product questions have been added yet. Contact us if you would like help choosing.</p>}
          </div>
        </div>
      </section>
      <ProductReviews product={product} />
      {related.length ? <section className="bg-cream py-14"><div className="site-container"><h2 className="font-heading text-3xl text-forest">You may also like</h2><div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((item) => <CatalogCard key={item.id} product={item} />)}</div></div></section> : null}
      {zoomOpen ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4" role="dialog" aria-modal="true" aria-label="Zoomed product image" onClick={() => setZoomOpen(false)}>
          <button ref={closeZoomRef} type="button" aria-label="Close zoom" onClick={() => setZoomOpen(false)} className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-forest focus-visible:ring-2 focus-visible:ring-gold"><X /></button>
          <div className="relative h-[85vh] w-[min(92vw,1000px)]" onClick={(event) => event.stopPropagation()}>
            <CatalogImage src={product.images[imageIndex]?.src ?? ""} alt={product.images[imageIndex]?.alt ?? product.name} sizes="95vw" className="object-contain" />
          </div>
        </div>
      ) : null}
    </main>
  );
}
