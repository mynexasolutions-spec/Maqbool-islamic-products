"use client";

import Image from "next/image";
import { Check, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  createHeroSlide,
  createHomeBanner,
  deleteHeroSlide,
  deleteHomeBanner,
  setHomeBannerEnabled,
  updateHeroSlide,
  updateHomeBanner,
} from "@/app/admin/homepage/actions";
import type {
  CloudinaryUploadAsset,
  HeroSlideRecord,
  HomeBannerRecord,
} from "@/lib/cloudinary/types";
import { AdminPageHeader, AdminPanel } from "./admin-ui";
import { CloudinaryUploadButton } from "./cloudinary-upload-button";

const fieldClass = "min-h-11 w-full rounded-lg border border-[#d8d2c5] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]";

export function HomepageContentManager({
  initialHeroSlides,
  initialBanners,
  initialBannerEnabled,
}: {
  initialHeroSlides: HeroSlideRecord[];
  initialBanners: HomeBannerRecord[];
  initialBannerEnabled: boolean;
}) {
  const [slides, setSlides] = useState(initialHeroSlides);
  const [banners, setBanners] = useState(initialBanners);
  const [bannerEnabled, setBannerEnabled] = useState(initialBannerEnabled);
  const [heroDraft, setHeroDraft] = useState({ placement: "right" as "left" | "right", title: "", subtitle: "", altText: "", linkUrl: "" });
  const [bannerDraft, setBannerDraft] = useState({ title: "", altText: "", linkUrl: "" });
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function addHero(asset: CloudinaryUploadAsset) {
    const result = await createHeroSlide({ ...heroDraft, asset });
    setMessage(result.message);
    if (result.ok && result.id) {
      setSlides((current) => [...current, {
        id: result.id!,
        ...heroDraft,
        alt_text: heroDraft.altText || heroDraft.title || "Maqbool featured collection",
        link_url: heroDraft.linkUrl || null,
        secure_url: asset.secureUrl,
        public_id: asset.publicId,
        resource_type: asset.resourceType,
        format: asset.format,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        is_active: true,
        display_order: current.filter((slide) => slide.placement === heroDraft.placement).length,
      }]);
    }
  }

  async function addBanner(asset: CloudinaryUploadAsset) {
    const result = await createHomeBanner({ ...bannerDraft, asset });
    setMessage(result.message);
    if (result.ok && result.id) {
      setBanners((current) => [...current, {
        id: result.id!,
        title: bannerDraft.title,
        alt_text: bannerDraft.altText,
        link_url: bannerDraft.linkUrl || null,
        secure_url: asset.secureUrl,
        public_id: asset.publicId,
        resource_type: asset.resourceType,
        format: asset.format,
        width: asset.width,
        height: asset.height,
        bytes: asset.bytes,
        is_active: true,
        display_order: current.length,
      }]);
    }
  }

  return (
    <>
      <AdminPageHeader eyebrow="Storefront" title="Homepage media" description="Curate hero placements and the optional promotional banner gallery." />
      <p role="status" aria-live="polite" className="mb-5 min-h-5 text-sm font-semibold text-[#176342]">{message}</p>

      <AdminPanel className="mb-7 p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl text-[#123d32]">Hero slides</h2>
            <p className="mt-1 text-sm text-[#65736d]">Maximum five images in each left and right placement.</p>
          </div>
          <CloudinaryUploadButton scope="hero" onUploaded={addHero} disabled={pending || slides.filter((slide) => slide.placement === heroDraft.placement).length >= 5} label="Upload hero slide" />
        </div>
        <div className="mb-6 grid gap-4 lg:grid-cols-2">
          <label className="text-sm font-bold text-[#2a4038]">Placement<select value={heroDraft.placement} onChange={(event) => setHeroDraft({ ...heroDraft, placement: event.target.value as "left" | "right" })} className={`mt-1.5 ${fieldClass}`}><option value="left">Left</option><option value="right">Right</option></select></label>
          <label className="text-sm font-bold text-[#2a4038]">Title<input value={heroDraft.title} onChange={(event) => setHeroDraft({ ...heroDraft, title: event.target.value })} maxLength={120} className={`mt-1.5 ${fieldClass}`} /></label>
          <label className="text-sm font-bold text-[#2a4038]">Subtitle<input value={heroDraft.subtitle} onChange={(event) => setHeroDraft({ ...heroDraft, subtitle: event.target.value })} maxLength={240} className={`mt-1.5 ${fieldClass}`} /></label>
          <label className="text-sm font-bold text-[#2a4038]">Image description<input value={heroDraft.altText} onChange={(event) => setHeroDraft({ ...heroDraft, altText: event.target.value })} maxLength={180} className={`mt-1.5 ${fieldClass}`} /></label>
          <label className="text-sm font-bold text-[#2a4038]">Optional link<input value={heroDraft.linkUrl} onChange={(event) => setHeroDraft({ ...heroDraft, linkUrl: event.target.value })} placeholder="/shop or https://…" className={`mt-1.5 ${fieldClass}`} /></label>
        </div>
        {slides.length === 0 ? <Empty text="No hero slides have been uploaded." /> : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {slides.map((slide) => (
              <li key={slide.id}><HeroEditor slide={slide} pending={pending} onChange={(patch) => setSlides((current) => current.map((item) => item.id === slide.id ? { ...item, ...patch } : item))} onMessage={setMessage} onDelete={() => setSlides((current) => current.filter((item) => item.id !== slide.id))} run={startTransition} /></li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <AdminPanel className="p-5 sm:p-6">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl text-[#123d32]">Home banners</h2>
            <p className="mt-1 text-sm text-[#65736d]">An optional gallery of up to eight promotional images.</p>
          </div>
          <CloudinaryUploadButton scope="home-banner" onUploaded={addBanner} disabled={pending || banners.length >= 8} label="Upload home banner" />
        </div>
        <label className="mb-6 flex min-h-11 items-center gap-3 rounded-lg bg-[#f7f5ee] px-4 text-sm font-bold text-[#2a4038]">
          <input type="checkbox" checked={bannerEnabled} onChange={(event) => {
            const enabled = event.target.checked;
            setBannerEnabled(enabled);
            startTransition(async () => {
              const result = await setHomeBannerEnabled(enabled);
              setMessage(result.message);
              if (!result.ok) setBannerEnabled(!enabled);
            });
          }} className="h-5 w-5 accent-[#176342]" />
          Show banner gallery on the homepage
        </label>
        <div className="mb-6 grid gap-4 lg:grid-cols-3">
          <label className="text-sm font-bold text-[#2a4038]">Title<input value={bannerDraft.title} onChange={(event) => setBannerDraft({ ...bannerDraft, title: event.target.value })} maxLength={120} className={`mt-1.5 ${fieldClass}`} /></label>
          <label className="text-sm font-bold text-[#2a4038]">Image description<input value={bannerDraft.altText} onChange={(event) => setBannerDraft({ ...bannerDraft, altText: event.target.value })} maxLength={180} className={`mt-1.5 ${fieldClass}`} /></label>
          <label className="text-sm font-bold text-[#2a4038]">Optional link<input value={bannerDraft.linkUrl} onChange={(event) => setBannerDraft({ ...bannerDraft, linkUrl: event.target.value })} placeholder="/shop or https://…" className={`mt-1.5 ${fieldClass}`} /></label>
        </div>
        {banners.length === 0 ? <Empty text="No home banners have been uploaded." /> : (
          <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {banners.map((banner) => (
              <li key={banner.id}><BannerEditor banner={banner} pending={pending} onChange={(patch) => setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, ...patch } : item))} onMessage={setMessage} onDelete={() => setBanners((current) => current.filter((item) => item.id !== banner.id))} run={startTransition} /></li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-[#cfc7b8] bg-[#faf9f5] px-5 py-10 text-center text-sm text-[#69756f]">{text}</p>;
}

type Runner = (callback: () => Promise<void>) => void;

function HeroEditor({ slide, pending, onChange, onMessage, onDelete, run }: {
  slide: HeroSlideRecord; pending: boolean; onChange: (patch: Partial<HeroSlideRecord>) => void; onMessage: (value: string) => void; onDelete: () => void; run: Runner;
}) {
  return <article className="overflow-hidden rounded-xl border border-[#ded9cc] bg-white"><div className="relative aspect-[16/10]"><Image src={slide.secure_url} alt={slide.alt_text} fill className="object-cover" sizes="33vw" /></div><div className="space-y-3 p-4">
    <label className="block text-xs font-bold">Title<input value={slide.title} onChange={(event) => onChange({ title: event.target.value })} className={`mt-1 ${fieldClass}`} /></label>
    <label className="block text-xs font-bold">Subtitle<input value={slide.subtitle} onChange={(event) => onChange({ subtitle: event.target.value })} className={`mt-1 ${fieldClass}`} /></label>
    <label className="block text-xs font-bold">Image description<input value={slide.alt_text} onChange={(event) => onChange({ alt_text: event.target.value })} className={`mt-1 ${fieldClass}`} /></label>
    <label className="block text-xs font-bold">Link<input value={slide.link_url ?? ""} onChange={(event) => onChange({ link_url: event.target.value || null })} className={`mt-1 ${fieldClass}`} /></label>
    <div className="grid grid-cols-2 gap-3"><label className="text-xs font-bold">Placement<select value={slide.placement} onChange={(event) => onChange({ placement: event.target.value as "left" | "right" })} className={`mt-1 ${fieldClass}`}><option value="left">Left</option><option value="right">Right</option></select></label><label className="text-xs font-bold">Order<input type="number" min={0} value={slide.display_order} onChange={(event) => onChange({ display_order: Math.max(0, Number(event.target.value)) })} className={`mt-1 ${fieldClass}`} /></label></div>
    <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={slide.is_active} onChange={(event) => onChange({ is_active: event.target.checked })} className="h-5 w-5 accent-[#176342]" />Active</label>
    <EditorButtons pending={pending} saveLabel={`Save ${slide.title || "hero slide"}`} deleteLabel={`Delete ${slide.title || "hero slide"}`} onSave={() => run(async () => { const result = await updateHeroSlide({ id: slide.id, placement: slide.placement, title: slide.title, subtitle: slide.subtitle, altText: slide.alt_text, linkUrl: slide.link_url, isActive: slide.is_active, displayOrder: slide.display_order }); onMessage(result.message); })} onDelete={() => run(async () => { const result = await deleteHeroSlide(slide.id); onMessage(result.message); if (result.ok) onDelete(); })} />
  </div></article>;
}

function BannerEditor({ banner, pending, onChange, onMessage, onDelete, run }: {
  banner: HomeBannerRecord; pending: boolean; onChange: (patch: Partial<HomeBannerRecord>) => void; onMessage: (value: string) => void; onDelete: () => void; run: Runner;
}) {
  return <article className="overflow-hidden rounded-xl border border-[#ded9cc] bg-white"><div className="relative aspect-[16/10]"><Image src={banner.secure_url} alt={banner.alt_text || ""} fill className="object-cover" sizes="33vw" /></div><div className="space-y-3 p-4">
    <label className="block text-xs font-bold">Title<input value={banner.title} onChange={(event) => onChange({ title: event.target.value })} className={`mt-1 ${fieldClass}`} /></label>
    <label className="block text-xs font-bold">Image description<input value={banner.alt_text} onChange={(event) => onChange({ alt_text: event.target.value })} className={`mt-1 ${fieldClass}`} /></label>
    <label className="block text-xs font-bold">Link<input value={banner.link_url ?? ""} onChange={(event) => onChange({ link_url: event.target.value || null })} className={`mt-1 ${fieldClass}`} /></label>
    <label className="block text-xs font-bold">Order<input type="number" min={0} value={banner.display_order} onChange={(event) => onChange({ display_order: Math.max(0, Number(event.target.value)) })} className={`mt-1 ${fieldClass}`} /></label>
    <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={banner.is_active} onChange={(event) => onChange({ is_active: event.target.checked })} className="h-5 w-5 accent-[#176342]" />Active</label>
    <EditorButtons pending={pending} saveLabel={`Save ${banner.title || "banner"}`} deleteLabel={`Delete ${banner.title || "banner"}`} onSave={() => run(async () => { const result = await updateHomeBanner({ id: banner.id, title: banner.title, altText: banner.alt_text, linkUrl: banner.link_url, isActive: banner.is_active, displayOrder: banner.display_order }); onMessage(result.message); })} onDelete={() => run(async () => { const result = await deleteHomeBanner(banner.id); onMessage(result.message); if (result.ok) onDelete(); })} />
  </div></article>;
}

function EditorButtons({ pending, saveLabel, deleteLabel, onSave, onDelete }: { pending: boolean; saveLabel: string; deleteLabel: string; onSave: () => void; onDelete: () => void }) {
  return <div className="grid grid-cols-2 gap-2"><button type="button" disabled={pending} onClick={onSave} aria-label={saveLabel} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#e3f2eb] text-sm font-bold text-[#176342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176342]"><Check className="mr-2 h-4 w-4" aria-hidden="true" />Save</button><button type="button" disabled={pending} onClick={onDelete} aria-label={deleteLabel} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#fff0ed] text-sm font-bold text-[#9a3d2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a3d2e]"><Trash2 className="mr-2 h-4 w-4" aria-hidden="true" />Delete</button></div>;
}
