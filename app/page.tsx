import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Baby,
  BadgeCheck,
  BookOpen,
  CreditCard,
  Gift,
  HandCoins,
  House,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CatalogCard } from "@/components/catalog/catalog-card";
import { Faq, type FaqItem } from "@/components/faq";
import { Newsletter } from "@/components/newsletter";
import { HeroMedia } from "@/components/home/hero-media";
import { HomeBannerGallery } from "@/components/home/home-banner-gallery";
import { ReviewCarousel } from "@/components/home/review-carousel";
import { getHomepageContent, getHomepageReviews, type HomepageReview } from "@/lib/homepage-content";
import { getFeaturedProducts } from "@/lib/catalog-repository";
import { getRequestMarketSlug } from "@/lib/market-server";
import { marketHref } from "@/lib/markets";

export const metadata: Metadata = {
  title: "Maqbool Islamic Products - Everything for Your Deen",
};

const quickCategories = [
  [BookOpen, "Quran & Tafsir"],
  [Sparkles, "Prayer Mats"],
  [ShoppingBag, "Ittars & Perfumes"],
  [Gift, "Islamic Gifts"],
  [HandCoins, "Tasbih & Misbaha"],
  [House, "Home & Decor"],
  [BookOpen, "Books"],
  [Baby, "Kids Collection"],
] as const;

const featured = [
  ["Quran & Tafsir", "/quran.webp", "Beautiful Quran Book Cover"],
  ["Prayer Mats", "/mat.webp", "Embroidered Emerald Green Prayer Mat"],
  ["Ittars & Perfumes", "/ittar.webp", "Luxury Glass Attar Perfumes"],
  ["Tasbih & Misbaha", "/tasbih.webp", "Traditional Islamic Prayer Beads"],
] as const;

const faqs: FaqItem[] = [
  {
    question: "Are all your products 100% authentic and halal?",
    answer:
      "Yes, absolutely. All our items, including Ittars, Quran editions, and prayer accessories, are sourced from trusted and verified authentic manufacturers.",
  },
  {
    question: "How long does delivery usually take?",
    answer:
      "Orders are processed within 24 hours. Delivery typically takes between 3 to 5 business days depending on your location in India.",
  },
  {
    question: "Is Cash on Delivery (COD) available for my area?",
    answer:
      "Yes, Cash on Delivery is available across most pincodes in India for orders. You can also pay online via UPI, Cards, or Net Banking.",
  },
  {
    question: "What is your return and exchange policy?",
    answer:
      "We offer a hassle-free 7-day return policy. If you receive a damaged or incorrect item, contact our customer support team to initiate a return or replacement.",
  },
];

const fallbackReviews: HomepageReview[] = [
  {
    id: "fallback-quran",
    customerName: "Zaid Khan",
    rating: 5,
    body: "The paper quality and binding of the Holy Quran edition is top-notch. Clear text and superb craftsmanship!",
    productName: "The Holy Quran (Arabic Text)",
    createdAt: "2026-01-18T00:00:00.000Z",
  },
  {
    id: "fallback-mat",
    customerName: "Fatima S.",
    rating: 5,
    body: "The velvet prayer mat is incredibly soft and comfortable for daily Salah. Very happy with the fast delivery as well.",
    productName: "Premium Velvet Prayer Mat",
    createdAt: "2026-01-12T00:00:00.000Z",
  },
  {
    id: "fallback-attar",
    customerName: "Mohammad Tariq",
    rating: 5,
    body: "The Oud Al Haramain Attar fragrance stays for almost the entire day. Pure quality and alcohol-free.",
    productName: "Oud Al Haramain Premium Attar",
    createdAt: "2026-01-05T00:00:00.000Z",
  },
  {
    id: "fallback-tasbih",
    customerName: "Aisha Rahman",
    rating: 5,
    body: "The tasbih feels beautifully balanced in the hand and arrived in thoughtful packaging. It has become part of my daily remembrance.",
    productName: "Natural Stone Tasbih",
    createdAt: "2025-12-28T00:00:00.000Z",
  },
];

export default async function HomePage() {
  const marketSlug = await getRequestMarketSlug();
  const [homepage, bestSellers, approvedReviews] = await Promise.all([
    getHomepageContent(),
    getFeaturedProducts(5, marketSlug).catch(() => []),
    getHomepageReviews(),
  ]);
  const displayedReviews = approvedReviews.length >= 4
    ? approvedReviews
    : [...approvedReviews, ...fallbackReviews].slice(0, 6);
  const displayedFaqs = homepage.available
    ? homepage.faqs.map(({ question, answer }) => ({ question, answer }))
    : faqs;

  return (
    <>
      <Header />
      <main>
        <section className="overflow-hidden bg-cream pb-[60px] pt-4 lg:py-[60px]">
          <div className="site-container grid items-center gap-10 lg:grid-cols-[1.1fr_.9fr]">
            <div className="order-2 lg:order-1">
              <p className="mb-[15px] text-[0.85rem] font-semibold uppercase tracking-[2px] text-gold">
                Strengthen Your Connection
              </p>
              <h1 className="font-heading text-[2.8rem] leading-[1.15] text-forest sm:text-[3.5rem]">
                Everything for <span className="text-gold">Your Deen</span>,<br />
                All in One Place.
              </h1>
              <p className="mb-[35px] mt-5 max-w-[480px] text-[0.95rem] leading-6 text-muted">
                Premium quality Islamic essentials curated with love and care to bring peace to
                your heart and barakah to your life.
              </p>
              <div className="mb-10 flex flex-wrap gap-[15px]">
                <Link
                  href={marketHref(marketSlug, "/shop")}
                  className="rounded bg-forest px-[30px] py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-light"
                >
                  Shop Now
                </Link>
                <Link
                  href={`${marketHref(marketSlug, "/")}#categories`}
                  className="rounded border border-forest px-[30px] py-3 text-sm font-semibold text-forest transition-colors hover:bg-forest hover:text-white"
                >
                  Explore Collections
                </Link>
              </div>
              <div className="flex flex-wrap gap-[30px] border-t border-forest/10 pt-6">
                {[
                  [BadgeCheck, "100% Authentic Products"],
                  [ShieldCheck, "Secure & Safe Payments"],
                  [PackageCheck, "7-Day Easy Returns"],
                ].map(([Icon, text]) => (
                  <span key={text as string} className="flex items-center gap-2 text-xs font-semibold text-forest">
                    <Icon className="h-5 w-5 text-gold" />
                    {text as string}
                  </span>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <HeroMedia slides={homepage.heroSlides} marketSlug={marketSlug} />
            </div>
          </div>
        </section>

        <section className="border-b border-[#f7f4eb] py-[50px]">
          <div className="site-container flex justify-between gap-5 overflow-x-auto pb-2.5 pt-2">
            {quickCategories.map(([Icon, title]) => (
              <Link key={title} href={marketHref(marketSlug, "/shop")} className="group flex min-w-[100px] flex-col items-center text-center">
                <span className="mb-3 flex h-[70px] w-[70px] items-center justify-center rounded-full bg-cream text-forest transition-all group-hover:-translate-y-1 group-hover:bg-forest group-hover:text-white">
                  <Icon className="h-6 w-6" />
                </span>
                <span className="text-xs font-semibold">{title}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-forest py-5 text-white">
          <div className="site-container grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Truck, "Market-based Shipping", "Local rates shown at checkout"],
              [ShoppingBag, "Cash on Delivery", "Available across India"],
              [CreditCard, "Secure Payment", "100% protected"],
              [Star, "Trusted by Thousands", "4.9 ★★★★★ Ratings"],
            ].map(([Icon, title, text]) => (
              <div key={title as string} className="flex items-center gap-[15px]">
                <Icon className="h-7 w-7 text-gold" />
                <span>
                  <strong className="block text-sm font-semibold">{title as string}</strong>
                  <span className="text-xs text-[#b3c7c2]">{text as string}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        <section id="categories" className="site-container py-[60px]">
          <h2 className="section-title">Featured Categories</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {featured.map(([title, image, alt]) => (
              <Link
                key={title}
                href={marketHref(marketSlug, "/shop")}
                className="group overflow-hidden rounded-lg bg-cream text-center shadow-[0_5px_15px_rgba(0,0,0,.02)] transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-[4/3] overflow-hidden sm:aspect-square">
                  <Image src={image} alt={alt} fill className="object-cover transition-transform group-hover:scale-105" />
                </div>
                <div className="bg-white p-[15px]">
                  <h3 className="font-heading text-lg text-forest">{title}</h3>
                  <span className="text-xs font-semibold text-muted">Shop Now</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section id="best-sellers" className="site-container pb-2">
          <h2 className="section-title">Best Sellers</h2>
          {bestSellers.length ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-[15px] lg:grid-cols-3 xl:grid-cols-5">
              {bestSellers.map((product) => (
                <CatalogCard key={product.id} product={product} compact />
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-dashed border-[#d8d0bc] bg-cream px-6 py-10 text-center text-sm text-muted">
              Best sellers will appear once the catalog connection is available.
            </p>
          )}
        </section>

        <section className="site-container py-[70px]">
          <div className="grid items-center gap-[30px] rounded-xl border border-[#ebdcb9] bg-cream p-10 lg:grid-cols-[.9fr_1.1fr_1fr]">
            <div className="relative h-[250px] overflow-hidden rounded-lg">
              <Image
                src="/ramadan.webp"
                alt="Glowing Golden Moroccan Lantern"
                fill
                loading="eager"
                sizes="(max-width: 1023px) calc(100vw - 80px), 30vw"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-gold">Ramadan Kareem</p>
              <h2 className="my-2 font-heading text-[2.2rem] leading-tight text-forest">
                Prepare for a <br />Blessed Ramadan
              </h2>
              <p className="mb-6 text-sm text-muted">
                Get everything you need for a spiritually enriching Ramadan.
              </p>
              <Link href={marketHref(marketSlug, "/shop")} className="inline-block rounded bg-forest px-7 py-3 text-sm font-semibold text-white">
                Shop Ramadan Collection
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-5">
              {[
                ["Beautiful Gift Packaging", "Perfect for your loved ones"],
                ["Exclusive Ramadan Offers", "Unmatched value deals"],
                ["Spiritual & Authentic Products", "Strictly vetted sources"],
                ["Spread Barakah This Ramadan", "Share blessings globally"],
              ].map(([title, text]) => (
                <div key={title} className="rounded-md border border-gold/20 bg-white p-[15px] text-center">
                  <Gift className="mx-auto mb-2 h-5 w-5 text-forest" />
                  <h3 className="text-xs font-bold">{title}</h3>
                  <p className="mt-1 text-[0.7rem] text-muted">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {homepage.bannerEnabled && <HomeBannerGallery banners={homepage.banners} marketSlug={marketSlug} />}

        <section id="reviews" className="site-container pb-[70px]">
          <h2 className="section-title">Customer Reviews</h2>
          <ReviewCarousel reviews={displayedReviews} />
        </section>

        {displayedFaqs.length > 0 && <section id="faqs" className="border-t border-[#ebdcb9] bg-cream py-[60px]">
          <div className="site-container">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <Faq items={displayedFaqs} />
          </div>
        </section>}
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
