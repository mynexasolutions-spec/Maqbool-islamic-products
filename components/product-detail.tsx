"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, MapPin, Minus, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const tabs = ["Description", "Specifications", "Reviews (1,256)"] as const;

export function ProductDetail() {
  const [image, setImage] = useState("/quran.webp");
  const [quantity, setQuantity] = useState(1);
  const [edition, setEdition] = useState("Standard (Medium)");
  const [tab, setTab] = useState<(typeof tabs)[number]>("Description");

  return (
    <>
      <section className="grid gap-10 lg:grid-cols-2">
        <div className="grid gap-4 sm:grid-cols-[76px_1fr]">
          <div className="order-2 flex gap-3 sm:order-1 sm:flex-col">
            {[
              ["/quran.webp", "Quran Thumb 1"],
              ["/quran.hero.webp", "Quran Thumb 2"],
            ].map(([src, alt]) => (
              <button
                key={src}
                onClick={() => setImage(src)}
                className={`relative h-[76px] w-[76px] overflow-hidden rounded border-2 ${
                  image === src ? "border-gold" : "border-transparent"
                }`}
              >
                <Image src={src} alt={alt} fill className="object-cover" />
              </button>
            ))}
          </div>
          <div className="relative order-1 h-[480px] overflow-hidden rounded-lg bg-cream sm:order-2">
            <Image src={image} alt="The Holy Quran Gold Embossed Edition" fill priority className="object-cover" />
            <span className="absolute left-4 top-4 rounded bg-[#cc4b4b] px-2.5 py-1 text-xs font-bold text-white">
              22% OFF
            </span>
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[1px] text-gold">
            Maqbool Islamic Products Classics
          </p>
          <h1 className="mt-2 font-heading text-4xl leading-tight text-forest">
            The Holy Quran (Gold Embossed Edition)
          </h1>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-1 text-[#e0aa3e]">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-3.5 w-3.5 fill-current" />
              ))}
              <span className="ml-1 text-muted">4.9 (1,256 reviews)</span>
            </span>
            <span className="rounded bg-[#e2f0eb] px-2 py-1 text-xs font-semibold text-forest-light">
              In Stock
            </span>
          </div>
          <div className="mt-5 flex items-end gap-3">
            <span className="text-3xl font-bold text-forest">₹699</span>
            <span className="pb-1 text-lg text-muted line-through">₹899</span>
            <span className="pb-1 text-sm font-semibold text-[#cc4b4b]">You Save ₹200</span>
          </div>
          <p className="mt-5 border-b border-[#eee8d5] pb-6 text-sm leading-6 text-muted">
            Beautifully bound in premium faux leather with intricate metallic gold foil
            embossing. Featuring high-clarity Arabic typography printed on non-reflective cream
            paper designed for comfortable reading during extended recitation.
          </p>

          <fieldset className="mt-6">
            <legend className="mb-3 text-sm font-bold text-forest">Edition Size:</legend>
            <div className="flex flex-wrap gap-2">
              {["Standard (Medium)", "Large (Desk Edition)", "Pocket Edition"].map((option) => (
                <button
                  type="button"
                  key={option}
                  onClick={() => setEdition(option)}
                  className={`rounded border px-4 py-2 text-xs font-semibold ${
                    edition === option
                      ? "border-forest bg-forest text-white"
                      : "border-[#d1cbbd] bg-white text-[#2b2b2b]"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="mt-7 flex flex-wrap gap-3">
            <div className="flex h-11 items-center rounded border border-[#d1cbbd]">
              <button
                aria-label="Decrease quantity"
                onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                className="px-3"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
              <button
                aria-label="Increase quantity"
                onClick={() => setQuantity((current) => current + 1)}
                className="px-3"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <Button className="h-11 flex-1 rounded bg-forest px-8 hover:bg-forest-light">
              Add To Cart
            </Button>
            <Button
              variant="outline"
              className="h-11 flex-1 rounded border-forest text-forest hover:bg-forest hover:text-white"
            >
              Buy It Now
            </Button>
          </div>

          <div className="mt-7 rounded-lg border border-[#ebdcb9] bg-cream p-4">
            <h2 className="flex items-center gap-2 text-sm font-bold text-forest">
              <MapPin className="h-4 w-4 text-gold" /> Check Delivery &amp; COD Availability
            </h2>
            <div className="mt-3 flex">
              <Input placeholder="Enter Pincode" aria-label="Pincode" className="rounded-r-none bg-white" />
              <Button className="rounded-l-none bg-forest">Check</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-[60px] border-y border-[#eee8d5]">
        <div className="flex overflow-x-auto">
          {tabs.map((item) => (
            <button
              key={item}
              onClick={() => setTab(item)}
              className={`min-w-fit border-b-2 px-7 py-4 text-sm font-semibold ${
                tab === item ? "border-gold text-forest" : "border-transparent text-muted"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="min-h-[190px] py-8 text-sm leading-7 text-muted">
          {tab === "Description" && (
            <div>
              <p>
                Experience the divine text in a binding crafted with reverence and aesthetic
                perfection. The Holy Quran Gold Embossed Edition is created using premium 80 GSM
                smooth cream pages that ensure zero bleed-through and minimal eye strain.
              </p>
              <ul className="mt-4 space-y-2">
                {[
                  "Clear, sharp Uthmani script calibrated for readability.",
                  "Durable gold-gilded page edges protecting against moisture and wear.",
                  "Includes two woven satin bookmark ribbons.",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-gold" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tab === "Specifications" && (
            <dl className="grid max-w-3xl sm:grid-cols-2">
              {[
                ["Binding Type", "Hardcover Faux Leather with Gold Foil Stamp"],
                ["Script Type", "Uthmani Script (15 Lines per page)"],
                ["Paper Quality", "80 GSM Premium Opaque Cream Paper"],
                ["Dimensions", "14 cm x 20 cm x 3.5 cm"],
                ["Weight", "850g"],
              ].map(([term, value]) => (
                <div key={term} className="border-b border-[#eee8d5] p-3">
                  <dt className="font-semibold text-forest">{term}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          )}
          {tab === "Reviews (1,256)" && (
            <article className="rounded-lg bg-cream p-5">
              <p className="gold-stars">★★★★★</p>
              <p className="mt-2 font-semibold text-forest">M. Tariq <span className="font-normal text-muted">- Verified Buyer</span></p>
              <p className="mt-2">
                Extremely high quality! The binding is sturdy, and the paper text is crystal
                clear. Arrived safely in 3 days.
              </p>
            </article>
          )}
        </div>
      </section>
    </>
  );
}
