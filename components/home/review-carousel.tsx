"use client";

import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { HomepageReview } from "@/lib/homepage-content";

const AUTOPLAY_INTERVAL = 5_000;
const INTERACTION_PAUSE = 8_000;

function visibleCountForWidth(width: number) {
  if (width >= 1024) return 3;
  if (width >= 640) return 2;
  return 1;
}

function ReviewCard({ review }: { review: HomepageReview }) {
  const date = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(review.createdAt));

  return (
    <article className="flex min-h-[260px] flex-col rounded-lg border border-[#f0ebde] bg-white p-6 shadow-[0_8px_24px_rgba(15,56,44,.05)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-[0.95rem] font-bold text-forest">{review.customerName}</h3>
          <p className="mt-1 text-[0.7rem] text-muted">{date}</p>
        </div>
        <span className="shrink-0 rounded bg-[#e2f0eb] px-1.5 py-0.5 text-[0.7rem] font-semibold text-forest-light">
          Verified
        </span>
      </div>
      <div className="my-3 flex gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            aria-hidden="true"
            className={`h-3.5 w-3.5 ${index < review.rating ? "fill-[#b77c12] text-[#b77c12]" : "fill-transparent text-[#cfc8b8]"}`}
          />
        ))}
      </div>
      <p className="line-clamp-5 text-sm leading-6 text-muted">&ldquo;{review.body}&rdquo;</p>
      <p className="mt-auto pt-4 text-xs font-semibold text-forest">{review.productName}</p>
    </article>
  );
}

export function ReviewCarousel({ reviews }: { reviews: HomepageReview[] }) {
  const [startIndex, setStartIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pausedUntil, setPausedUntil] = useState(0);
  const interactionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateCount = () => setVisibleCount(visibleCountForWidth(window.innerWidth));
    updateMotion();
    updateCount();
    media.addEventListener("change", updateMotion);
    window.addEventListener("resize", updateCount);
    return () => {
      media.removeEventListener("change", updateMotion);
      window.removeEventListener("resize", updateCount);
    };
  }, []);

  const move = useCallback((direction: number, interacted = false) => {
    setStartIndex((current) => (current + direction + reviews.length) % reviews.length);
    if (interacted) {
      setPausedUntil(Date.now() + INTERACTION_PAUSE);
      if (interactionTimer.current) clearTimeout(interactionTimer.current);
      interactionTimer.current = setTimeout(() => setPausedUntil(0), INTERACTION_PAUSE);
    }
  }, [reviews.length]);

  useEffect(() => {
    if (reviews.length <= visibleCount || reducedMotion || hovered || focused || pausedUntil > Date.now()) return;
    const timer = window.setInterval(() => move(1), AUTOPLAY_INTERVAL);
    return () => window.clearInterval(timer);
  }, [focused, hovered, move, pausedUntil, reducedMotion, reviews.length, visibleCount]);

  useEffect(() => () => {
    if (interactionTimer.current) clearTimeout(interactionTimer.current);
  }, []);

  if (!reviews.length) return null;
  const count = Math.min(visibleCount, reviews.length);
  const visibleReviews = Array.from(
    { length: count },
    (_, offset) => reviews[(startIndex + offset) % reviews.length],
  );
  const hasNavigation = reviews.length > count;

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Customer reviews"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
    >
      <div className={`grid gap-5 ${count === 1 ? "grid-cols-1" : count === 2 ? "grid-cols-2" : "grid-cols-3"}`} aria-live="polite">
        {visibleReviews.map((review) => <ReviewCard key={review.id} review={review} />)}
      </div>
      {hasNavigation ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button type="button" onClick={() => move(-1, true)} aria-label="Show previous customer reviews" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest bg-white text-forest transition hover:bg-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 motion-reduce:transition-none">
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <p className="min-w-16 text-center text-xs font-semibold text-muted" aria-hidden="true">{startIndex + 1} / {reviews.length}</p>
          <button type="button" onClick={() => move(1, true)} aria-label="Show next customer reviews" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-forest bg-white text-forest transition hover:bg-forest hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 motion-reduce:transition-none">
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
