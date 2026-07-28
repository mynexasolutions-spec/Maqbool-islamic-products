import type { Metadata } from "next";
import Image from "next/image";
import { BadgeCheck, Gem, Gift, HeartHandshake, PackageCheck, ShieldCheck } from "lucide-react";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { PageBanner } from "@/components/layout/page-banner";

export const metadata: Metadata = {
  title: "About Us - Maqbool Islamic Products",
};

const values = [
  {
    icon: Gem,
    title: "Uncompromising Quality",
    text: "We source non-reflective opaque paper, durable leather bindings, and pure non-alcoholic fragrance oils to ensure long-lasting quality.",
  },
  {
    icon: ShieldCheck,
    title: "Ethical & Pure",
    text: "All our products are ethically sourced, cruelty-free, and designed with full respect for Islamic guidelines and values.",
  },
  {
    icon: PackageCheck,
    title: "Reverent Packaging",
    text: "Every shipment is packaged with maximum care and protection, ensuring your sacred and luxury items arrive in pristine condition.",
  },
  {
    icon: HeartHandshake,
    title: "Dedicated Service",
    text: "Our customer support team is always ready to assist you with order inquiries, recommendations, or custom gifting needs.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Header />
      <PageBanner title="Our Story & Heritage" current="About Us" />
      <main>
        <section
          id="our-story"
          className="site-container scroll-mt-32 grid items-center gap-[50px] py-[70px] lg:grid-cols-2"
        >
          <div className="relative h-[460px] overflow-hidden rounded-[10px] shadow-[0_18px_35px_rgba(15,56,44,.1)]">
            <Image
              src="/quran.hero.webp"
              alt="Noor E Iman Heritage Quran Display"
              fill
              priority
              className="object-cover"
            />
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-gold">Our Heritage</p>
            <h1 className="font-heading text-[2.4rem] leading-tight text-forest">
              Crafting Islamic Lifestyle Essentials with Devotion &amp; Grace
            </h1>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted">
              <p>
                Founded with a passion for preserving traditional craftsmanship and spiritual
                elegance, <strong className="text-forest">Noor E Iman</strong> was built to
                provide households with authentic, high-quality Islamic essentials that enrich
                daily worship and reflection.
              </p>
              <p>
                From meticulously bound embossed Quran editions and ultra-soft plush velvet
                prayer mats to alcohol-free pure attar perfumes and hand-strung natural stone
                tasbihs, every product in our catalog is selected and designed with the utmost
                respect for Islamic traditions.
              </p>
              <p>
                We believe that items used for remembrance and worship should reflect beauty,
                quality, and reverence—serving as meaningful keepsakes for your home or cherished
                gifts for loved ones.
              </p>
            </div>
          </div>
        </section>

        <section className="bg-forest py-9 text-white">
          <div className="site-container grid gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["50,000+", "Happy Customers"],
              ["100%", "Authentic & Pure"],
              ["500+", "Curated Products"],
              ["4.9 ★", "Average Rating"],
            ].map(([number, label]) => (
              <div key={label}>
                <strong className="block font-heading text-[2rem] text-gold">{number}</strong>
                <span className="text-sm text-[#d4e0dc]">{label}</span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="why-choose-us"
          className="site-container scroll-mt-32 py-[70px]"
        >
          <h2 className="section-title">What Defines Maqbool Islamic Products?</h2>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="rounded-lg border border-[#ebdcb9] bg-cream p-7 text-center transition-transform hover:-translate-y-1"
              >
                <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-forest text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="font-heading text-xl text-forest">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="authenticity"
          className="site-container scroll-mt-32 grid items-center gap-[50px] pb-[70px] lg:grid-cols-2"
        >
          <div className="relative h-[460px] overflow-hidden rounded-[10px] shadow-[0_18px_35px_rgba(15,56,44,.1)]">
            <Image
              src="/ittar2.webp"
              alt="Authentic Islamic fragrance oils presented with care"
              fill
              sizes="(max-width: 1023px) calc(100vw - 40px), 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[2px] text-gold">
              Our Authenticity Standard
            </p>
            <h2 className="font-heading text-[2.4rem] leading-tight text-forest">
              Carefully sourced. Respectfully selected. Honestly represented.
            </h2>
            <p className="mt-5 text-sm leading-7 text-muted">
              Every item is reviewed for material quality, origin, and suitability before it
              joins our collection. We work with trusted makers and suppliers, describe
              products clearly, and never compromise the reverence due to essentials used in
              worship and remembrance.
            </p>
            <div className="mt-6 space-y-3 text-sm leading-7 text-muted">
              {[
                "Trusted, traceable suppliers",
                "Alcohol-free fragrance oils",
                "Quality checked before dispatch",
                "Clear materials and care guidance",
              ].map((standard) => (
                <div key={standard} className="flex items-center gap-3">
                  <BadgeCheck className="h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
                  <span className="font-semibold text-forest">{standard}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="site-container pb-[70px]">
          <div className="relative overflow-hidden rounded-xl border border-[#ebdcb9] bg-cream px-8 py-12 text-center">
            <Gift className="mx-auto h-8 w-8 text-gold" />
            <h2 className="mt-3 font-heading text-[2rem] text-forest">Our Promise To You</h2>
            <p className="mx-auto mt-5 max-w-[850px] font-heading text-lg leading-8 text-muted">
              &ldquo;When you shop with Maqbool Islamic Products, you are not simply acquiring a
              product—you are investing in items crafted to elevate your daily spiritual journey,
              inspire tranquility in your home, and connect generations through timeless
              tradition.&rdquo;
            </p>
            <div className="mt-6 flex justify-center gap-6 text-xs font-semibold text-forest">
              <span className="flex items-center gap-1.5"><BadgeCheck className="h-4 w-4 text-gold" /> Authentic</span>
              <span className="flex items-center gap-1.5"><HeartHandshake className="h-4 w-4 text-gold" /> Thoughtful</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
