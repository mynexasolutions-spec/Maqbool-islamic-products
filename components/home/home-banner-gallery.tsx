import Image from "next/image";
import Link from "next/link";
import type { HomeBannerRecord } from "@/lib/cloudinary/types";

export function HomeBannerGallery({ banners }: { banners: HomeBannerRecord[] }) {
  if (!banners.length) return null;
  return (
    <section aria-labelledby="home-banner-heading" className="site-container py-[70px]">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-[.18em] text-gold">Maqbool selections</p><h2 id="home-banner-heading" className="mt-1 font-heading text-3xl text-forest">Featured moments</h2></div>
        <Link href="/shop" className="min-h-11 rounded-md px-3 py-3 text-sm font-bold text-forest underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">Shop all</Link>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {banners.map((banner, index) => {
          const media = <><div className="relative aspect-[4/3] overflow-hidden"><Image src={banner.secure_url} alt={banner.alt_text || ""} fill className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none" sizes="(max-width: 640px) 100vw, 25vw" /></div>{banner.title && <p className="px-4 py-3 font-heading text-lg text-forest">{banner.title}</p>}</>;
          return <li key={banner.id} className={index === 0 && banners.length % 2 === 1 ? "sm:col-span-2 lg:col-span-1" : ""}>{banner.link_url ? <Link href={banner.link_url} className="group block overflow-hidden rounded-xl border border-[#ebdcb9] bg-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold">{media}</Link> : <div className="group overflow-hidden rounded-xl border border-[#ebdcb9] bg-white shadow-sm">{media}</div>}</li>;
        })}
      </ul>
    </section>
  );
}
