"use client";

import Image from "next/image";
import { GripVertical, ImageIcon, Pencil, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  createHeroSlide, createHomeBanner, deleteHeroSlide, deleteHomeBanner,
  setHomeBannerEnabled, updateHeroSlide, updateHomeBanner,
} from "@/app/admin/homepage/actions";
import type { CloudinaryUploadAsset, HeroSlideRecord, HomeBannerRecord } from "@/lib/cloudinary/types";
import { AdminPageHeader, AdminPanel } from "./admin-ui";
import { CloudinaryUploadButton } from "./cloudinary-upload-button";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type Draft = { placement: "left" | "right"; title: string; subtitle: string; altText: string; linkUrl: string };
const emptyDraft = (placement: "left" | "right"): Draft => ({ placement, title: "", subtitle: "", altText: "", linkUrl: "" });

export function HomepageContentManager({ initialHeroSlides, initialBanners, initialBannerEnabled }: {
  initialHeroSlides: HeroSlideRecord[]; initialBanners: HomeBannerRecord[]; initialBannerEnabled: boolean;
}) {
  const [slides, setSlides] = useState(initialHeroSlides);
  const [banners, setBanners] = useState(initialBanners);
  const [bannerEnabled, setBannerEnabled] = useState(initialBannerEnabled);
  const [newDraft, setNewDraft] = useState<Draft>(emptyDraft("left"));
  const [editing, setEditing] = useState<HeroSlideRecord | null>(null);
  const [bannerDraft, setBannerDraft] = useState({ title: "", altText: "", linkUrl: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [draggedId, setDraggedId] = useState("");
  const [pending, startTransition] = useTransition();

  async function addHero(asset: CloudinaryUploadAsset, placement: "left" | "right") {
    const draft = { ...newDraft, placement };
    const result = await createHeroSlide({ ...draft, asset });
    if (!result.ok || !result.id) { setError(result.message); return; }
    setSlides((current) => [...current, {
      id: result.id!, placement, title: draft.title, subtitle: draft.subtitle,
      alt_text: draft.altText || draft.title || "Maqbool hero slide", link_url: draft.linkUrl || null,
      secure_url: asset.secureUrl, public_id: asset.publicId, resource_type: asset.resourceType,
      format: asset.format, width: asset.width, height: asset.height, bytes: asset.bytes,
      is_active: true, display_order: current.filter((slide) => slide.placement === placement).length,
    }]);
    setNewDraft(emptyDraft(placement));
    setMessage("Hero slide uploaded.");
  }

  function moveSlide(targetId: string, placement: "left" | "right") {
    if (!draggedId || draggedId === targetId) return;
    const group = slides.filter((slide) => slide.placement === placement).sort((a, b) => a.display_order - b.display_order);
    const from = group.findIndex((slide) => slide.id === draggedId);
    const to = group.findIndex((slide) => slide.id === targetId);
    if (from < 0 || to < 0) return;
    const reordered = [...group];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    const orderMap = new Map(reordered.map((slide, index) => [slide.id, index]));
    setSlides((current) => current.map((slide) => orderMap.has(slide.id) ? { ...slide, display_order: orderMap.get(slide.id)! } : slide));
    startTransition(async () => {
      const results = await Promise.all(reordered.map((slide, index) => updateHeroSlide({
        id: slide.id, placement: slide.placement, title: slide.title, subtitle: slide.subtitle,
        altText: slide.alt_text, linkUrl: slide.link_url, isActive: slide.is_active, displayOrder: index,
      })));
      const failed = results.find((result) => !result.ok);
      if (failed) setError(failed.message); else setMessage("Slide order saved.");
    });
  }

  return <>
    <AdminPageHeader eyebrow="Storefront" title="Hero Section" description="Manage the sliding images for the storefront homepage." />
    <p className="mb-4 min-h-5 text-sm font-semibold text-[#176342]" role="status" aria-live="polite">{message}</p>
    {error && <p className="mb-5 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
    <div className="grid gap-7 xl:grid-cols-2">
      {(["left", "right"] as const).map((placement) => {
        const group = slides.filter((slide) => slide.placement === placement).sort((a, b) => a.display_order - b.display_order);
        return <AdminPanel key={placement} className="overflow-hidden p-4 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="flex items-center gap-2 text-xl font-bold"><ImageIcon className="h-5 w-5 text-[#8a8276]" />{placement === "left" ? "Left Area Images" : "Right Area Images"}</h2>{group.length >= 5 ? <span className="rounded-full border border-[#e5c98e] bg-[#fff8e8] px-3 py-1 text-xs font-semibold">Maximum 5 slides reached</span> : <CloudinaryUploadButton scope="hero" label="Add Slide" disabled={pending} onUploaded={(asset) => addHero(asset, placement)} />}</div>
          <p className="mt-6 text-sm text-[#7b6e63]">Upload high-quality images (16:9 recommended). They loop automatically. You have {group.filter((slide) => slide.is_active).length} active slides.</p>
          <ul className="mt-6 min-w-0 space-y-3">{group.map((slide, index) => <li key={slide.id} draggable onDragStart={() => setDraggedId(slide.id)} onDragOver={(event) => event.preventDefault()} onDrop={() => moveSlide(slide.id, placement)} className="flex min-h-[96px] min-w-0 flex-wrap items-center gap-3 rounded-xl border border-[#e8e3dc] bg-white px-3 py-3 sm:flex-nowrap sm:gap-4 sm:px-4">
            <GripVertical className="h-5 w-5 shrink-0 cursor-grab text-[#aaa39b]" aria-label={`Drag slide ${index + 1}`} />
            <Image src={slide.secure_url} alt={slide.alt_text} width={112} height={70} className="h-14 w-20 rounded-lg object-cover sm:h-[70px] sm:w-28" />
            <button type="button" onClick={() => setEditing(slide)} className="min-w-0 flex-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"><strong className="block truncate">{slide.title || `Slide ${index + 1}`}</strong><span className="block truncate text-xs text-[#8a8178]">{slide.public_id}</span></button>
            <label className="relative inline-flex min-h-11 min-w-11 cursor-pointer items-center justify-center"><span className="sr-only">Active</span><input type="checkbox" className="peer sr-only" checked={slide.is_active} onChange={(event) => { const active = event.target.checked; setSlides((current) => current.map((item) => item.id === slide.id ? { ...item, is_active: active } : item)); startTransition(async () => { const result = await updateHeroSlide({ id: slide.id, placement, title: slide.title, subtitle: slide.subtitle, altText: slide.alt_text, linkUrl: slide.link_url, isActive: active, displayOrder: slide.display_order }); if (!result.ok) setError(result.message); else setMessage(result.message); }); }} /><span className="h-6 w-11 rounded-full bg-[#ddd] after:absolute after:left-[3px] after:top-[13px] after:h-[18px] after:w-[18px] after:rounded-full after:bg-white after:transition peer-checked:bg-[#18b966] peer-checked:after:translate-x-5" /></label>
            <button type="button" onClick={() => setEditing(slide)} className="grid min-h-11 min-w-11 place-items-center text-[#777]" aria-label={`Edit ${slide.title || `slide ${index + 1}`}`}><Pencil className="h-4 w-4" /></button>
            <button type="button" onClick={() => startTransition(async () => { const result = await deleteHeroSlide(slide.id); if (result.ok) { setSlides((current) => current.filter((item) => item.id !== slide.id)); setMessage(result.message); } else setError(result.message); })} className="grid min-h-11 min-w-11 place-items-center text-[#b0aaa3] hover:text-red-700" aria-label={`Delete ${slide.title || `slide ${index + 1}`}`}><Trash2 className="h-4 w-4" /></button>
          </li>)}</ul>
          {!group.length && <p className="mt-6 rounded-xl border border-dashed p-10 text-center text-sm text-[#827a72]">No {placement} area slides yet.</p>}
        </AdminPanel>;
      })}
    </div>

    <AdminPanel className="mt-7 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-heading text-2xl text-[#123d32]">Home banners</h2><p className="text-sm text-[#65736d]">Optional gallery of up to eight promotional images.</p></div><CloudinaryUploadButton scope="home-banner" label="Upload home banner" disabled={pending || banners.length >= 8} onUploaded={async (asset) => { const result = await createHomeBanner({ ...bannerDraft, asset }); if (result.ok && result.id) { setBanners((current) => [...current, { id: result.id!, title: bannerDraft.title, alt_text: bannerDraft.altText, link_url: bannerDraft.linkUrl || null, secure_url: asset.secureUrl, public_id: asset.publicId, resource_type: asset.resourceType, format: asset.format, width: asset.width, height: asset.height, bytes: asset.bytes, is_active: true, display_order: current.length }]); setMessage(result.message); } else setError(result.message); }} /></div>
      <label className="mt-5 flex min-h-11 items-center gap-3 rounded-lg bg-[#f7f5ee] px-4 text-sm font-bold"><input type="checkbox" checked={bannerEnabled} onChange={(event) => { const enabled = event.target.checked; setBannerEnabled(enabled); startTransition(async () => { const result = await setHomeBannerEnabled(enabled); if (!result.ok) { setBannerEnabled(!enabled); setError(result.message); } else setMessage(result.message); }); }} />Show banner gallery on the homepage</label>
      <div className="mt-5 grid gap-3 md:grid-cols-3"><Input aria-label="New banner title" placeholder="Title" value={bannerDraft.title} onChange={(e) => setBannerDraft({ ...bannerDraft, title: e.target.value })} /><Input aria-label="New banner image description" placeholder="Image description" value={bannerDraft.altText} onChange={(e) => setBannerDraft({ ...bannerDraft, altText: e.target.value })} /><Input aria-label="New banner link" placeholder="Optional link" value={bannerDraft.linkUrl} onChange={(e) => setBannerDraft({ ...bannerDraft, linkUrl: e.target.value })} /></div>
      <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{banners.map((banner) => <li key={banner.id} className="overflow-hidden rounded-xl border"><Image src={banner.secure_url} alt={banner.alt_text} width={320} height={180} className="aspect-video w-full object-cover" /><div className="flex items-center gap-2 p-3"><span className="min-w-0 flex-1 truncate text-sm font-semibold">{banner.title || "Banner"}</span><button aria-label={`Toggle ${banner.title || "banner"}`} onClick={() => { const active = !banner.is_active; setBanners((current) => current.map((item) => item.id === banner.id ? { ...item, is_active: active } : item)); startTransition(async () => { const result = await updateHomeBanner({ id: banner.id, title: banner.title, altText: banner.alt_text, linkUrl: banner.link_url, isActive: active, displayOrder: banner.display_order }); if (!result.ok) setError(result.message); }); }}><span className={banner.is_active ? "text-green-700" : "text-[#888]"}>{banner.is_active ? "Active" : "Off"}</span></button><button aria-label={`Delete ${banner.title || "banner"}`} onClick={() => startTransition(async () => { const result = await deleteHomeBanner(banner.id); if (result.ok) setBanners((current) => current.filter((item) => item.id !== banner.id)); else setError(result.message); })}><Trash2 className="h-4 w-4 text-red-700" /></button></div></li>)}</ul>
    </AdminPanel>

    <Dialog open={Boolean(editing)} onClose={() => !pending && setEditing(null)} title="Edit hero slide">
      {editing && <form onSubmit={(event) => { event.preventDefault(); startTransition(async () => { const result = await updateHeroSlide({ id: editing.id, placement: editing.placement, title: editing.title, subtitle: editing.subtitle, altText: editing.alt_text, linkUrl: editing.link_url, isActive: editing.is_active, displayOrder: editing.display_order }); if (result.ok) { setSlides((current) => current.map((item) => item.id === editing.id ? editing : item)); setEditing(null); setMessage(result.message); } else setError(result.message); }); }} className="space-y-4">
        <label className="block text-sm font-semibold">Placement<Select className="mt-2 w-full" value={editing.placement} onChange={(e) => setEditing({ ...editing, placement: e.target.value as "left" | "right" })}><option value="left">Left</option><option value="right">Right</option></Select></label>
        <label className="block text-sm font-semibold">Title<Input className="mt-2" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></label>
        <label className="block text-sm font-semibold">Subtitle<Input className="mt-2" value={editing.subtitle} onChange={(e) => setEditing({ ...editing, subtitle: e.target.value })} /></label>
        <label className="block text-sm font-semibold">Image description<Input className="mt-2" value={editing.alt_text} onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })} /></label>
        <label className="block text-sm font-semibold">Optional link<Input className="mt-2" value={editing.link_url ?? ""} onChange={(e) => setEditing({ ...editing, link_url: e.target.value || null })} /></label>
        <div className="flex justify-end gap-3 pt-3"><Button type="button" variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button type="submit" disabled={pending}>Save slide</Button></div>
      </form>}
    </Dialog>
  </>;
}
