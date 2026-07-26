"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { HeroSlideRecord } from "@/lib/cloudinary/types";
import { cn } from "@/lib/utils";

function PlacementCarousel({ slides, priority }: { slides: HeroSlideRecord[]; priority?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = slides[Math.min(activeIndex, slides.length - 1)];

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!active) return null;
  const image = <Image src={active.secure_url} alt={active.alt_text} fill priority={priority} className="object-cover" sizes="(max-width: 1024px) 90vw, 45vw" />;
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="relative h-[350px] overflow-hidden rounded-[10px] shadow-[0_20px_40px_rgba(0,0,0,.08)] lg:h-[450px]">
        {active.link_url ? <Link href={active.link_url} aria-label={active.title || "View featured collection"} className="absolute inset-0 block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold">{image}</Link> : image}
      </div>
      {slides.length > 1 && (
        <div className="mt-4 flex min-h-11 items-center justify-center gap-2" role="group" aria-label="Choose hero slide">
          {slides.map((slide, index) => (
            <button key={slide.id} type="button" onClick={() => setActiveIndex(index)} aria-label={`Show slide ${index + 1}: ${slide.title || "featured image"}`} aria-current={activeIndex === index ? "true" : undefined} className={cn("min-h-6 min-w-6 rounded-full p-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold", activeIndex === index ? "after:block after:h-2 after:w-5 after:rounded after:bg-forest" : "after:block after:h-2 after:w-2 after:rounded-full after:bg-[#bcb5a5]")} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HeroMedia({ slides }: { slides: HeroSlideRecord[] }) {
  const left = slides.filter((slide) => slide.placement === "left");
  const right = slides.filter((slide) => slide.placement === "right");
  if (!slides.length) {
    return <div><div className="relative h-[350px] overflow-hidden rounded-[10px] shadow-[0_20px_40px_rgba(0,0,0,.08)] lg:h-[450px]"><Image src="/quran.hero.webp" alt="Holy Quran and Golden Lantern Setup" fill priority className="object-cover" /></div><div className="mt-5 flex justify-center gap-2" aria-hidden="true"><span className="h-2 w-5 rounded bg-forest" /><span className="h-2 w-2 rounded-full bg-[#d1cbbd]" /><span className="h-2 w-2 rounded-full bg-[#d1cbbd]" /></div></div>;
  }
  return <div className={cn("flex gap-3", left.length && right.length ? "flex-col sm:flex-row" : "")}><PlacementCarousel slides={left.length ? left : right} priority />{left.length > 0 && right.length > 0 && <PlacementCarousel slides={right} />}</div>;
}
