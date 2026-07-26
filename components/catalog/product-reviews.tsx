"use client";

import { FormEvent, useState, useTransition } from "react";
import { Star } from "lucide-react";
import { submitProductReview } from "@/app/shop/[slug]/actions";
import type { Product } from "@/lib/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProductReviews({ product }: { product: Product }) {
  const [rating, setRating] = useState(5);
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const submit = (event: FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      setError("");
      const result = await submitProductReview({ productId: product.id, productSlug: product.slug, orderNumber, phone, rating, body });
      if (result.ok) { setMessage(result.message); setOrderNumber(""); setPhone(""); setBody(""); } else setError(result.error);
    });
  };
  return <section id="reviews" className="site-container py-14 scroll-mt-24">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-[.15em] text-gold-dark">Verified buyers</p><h2 className="mt-1 font-heading text-3xl text-forest">What customers say</h2></div><p className="text-sm text-muted">{product.rating} average from {product.reviewCount.toLocaleString("en-IN")} reviews</p></div>
    <div className="mt-7 grid gap-7 lg:grid-cols-[1.3fr_.7fr]">
      <div>{product.reviews?.length ? <div className="grid gap-4 md:grid-cols-2">{product.reviews.map((review) => <article key={review.id} className="rounded-lg border border-[#ece5d3] p-5"><div className="flex text-[#bd861e]" aria-label={`${review.rating} out of 5 stars`}>{Array.from({ length: 5 }, (_, index) => <Star key={index} className={`h-3.5 w-3.5 ${index < review.rating ? "fill-current" : ""}`} aria-hidden="true" />)}</div><p className="mt-4 text-sm leading-6 text-muted">“{review.body}”</p><footer className="mt-5 border-t pt-3 text-xs"><strong className="text-forest">{review.name}</strong><time className="ml-2 text-muted">{new Date(review.createdAt).toLocaleDateString()}</time></footer></article>)}</div> : <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted">No approved reviews yet.</p>}</div>
      <form onSubmit={submit} className="rounded-xl border border-[#e2d8c2] bg-cream p-5"><h3 className="font-heading text-xl text-forest">Review a verified purchase</h3><p className="mt-1 text-xs leading-5 text-muted">Use the order number and phone from checkout.</p>
        <fieldset className="mt-4"><legend className="text-sm font-semibold">Rating</legend><div className="mt-2 flex gap-1">{[1,2,3,4,5].map((value) => <button type="button" key={value} aria-label={`${value} stars`} aria-pressed={rating === value} onClick={() => setRating(value)}><Star className={`h-7 w-7 text-[#bd861e] ${value <= rating ? "fill-current" : ""}`} /></button>)}</div></fieldset>
        <label className="mt-4 block text-sm font-semibold">Order number<Input className="mt-2 bg-white" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value.toUpperCase())} required /></label>
        <label className="mt-4 block text-sm font-semibold">Checkout phone<Input className="mt-2 bg-white" value={phone} onChange={(e) => setPhone(e.target.value)} required /></label>
        <label className="mt-4 block text-sm font-semibold">Review<Textarea className="mt-2 bg-white" minLength={10} maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} required /></label>
        {message && <p className="mt-3 text-sm text-green-800" role="status">{message}</p>}{error && <p className="mt-3 text-sm text-red-800" role="alert">{error}</p>}
        <Button className="mt-4 min-h-11" disabled={pending} type="submit">Submit for approval</Button>
      </form>
    </div>
  </section>;
}
