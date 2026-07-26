"use client";

import Image from "next/image";
import { Check, Star, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import {
  deleteProductImage,
  saveProductImage,
  updateProductImage,
} from "@/app/admin/media/actions";
import { CloudinaryUploadButton } from "./cloudinary-upload-button";

export type ProductImageManagerImage = {
  id: string;
  secureUrl: string;
  altText: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  colorVariantId?: string | null;
};

export type ProductImageManagerProps = {
  productId: string;
  productName: string;
  initialImages: ProductImageManagerImage[];
  colorVariants?: Array<{ id: string; label: string }>;
};

export function ProductImageManager({
  productId,
  productName,
  initialImages,
  colorVariants = [],
}: ProductImageManagerProps) {
  const [images, setImages] = useState(initialImages);
  const [altText, setAltText] = useState(productName);
  const [colorVariantId, setColorVariantId] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  function refreshRecord(id: string, patch: Partial<ProductImageManagerImage>) {
    setImages((current) => current.map((image) => image.id === id ? { ...image, ...patch } : image));
  }

  return (
    <section aria-labelledby="product-images-title" className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="product-images-title" className="font-heading text-xl text-[#123d32]">Product images</h2>
          <p className="mt-1 text-sm text-[#65736d]">Upload, feature, order, and associate images with color variants.</p>
        </div>
        <CloudinaryUploadButton
          scope="product"
          disabled={pending}
          onUploaded={async (asset) => {
            const result = await saveProductImage({
              productId,
              asset,
              altText,
              colorVariantId: colorVariantId || null,
            });
            setMessage(result.message);
            if (result.ok && result.id) {
              setImages((current) => [...current, {
                id: result.id!,
                secureUrl: asset.secureUrl,
                altText,
                colorVariantId: colorVariantId || null,
                isFeatured: current.length === 0,
                isActive: true,
                displayOrder: current.length,
              }]);
            }
          }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`image-alt-${productId}`} className="mb-1.5 block text-sm font-bold text-[#2a4038]">Alt text for new image</label>
          <input id={`image-alt-${productId}`} value={altText} onChange={(event) => setAltText(event.target.value)} maxLength={180} className="min-h-11 w-full rounded-lg border border-[#d8d2c5] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]" />
        </div>
        {colorVariants.length > 0 && (
          <div>
            <label htmlFor={`image-color-${productId}`} className="mb-1.5 block text-sm font-bold text-[#2a4038]">Color association</label>
            <select id={`image-color-${productId}`} value={colorVariantId} onChange={(event) => setColorVariantId(event.target.value)} className="min-h-11 w-full rounded-lg border border-[#d8d2c5] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]">
              <option value="">All colors</option>
              {colorVariants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}
            </select>
          </div>
        )}
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-sm font-medium text-[#176342]">{message}</p>
      {images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-[#cfc7b8] bg-[#faf9f5] px-5 py-10 text-center text-sm text-[#69756f]">No product images yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...images].sort((a, b) => a.displayOrder - b.displayOrder).map((image) => (
            <li key={image.id} className="overflow-hidden rounded-xl border border-[#ded9cc] bg-white">
              <div className="relative aspect-[4/3] bg-[#f4f1e8]">
                <Image src={image.secureUrl} alt={image.altText || ""} fill className="object-cover" sizes="(max-width: 640px) 100vw, 33vw" />
                {image.isFeatured && <span className="absolute left-3 top-3 rounded-full bg-[#123d32] px-2.5 py-1 text-xs font-bold text-white">Featured</span>}
              </div>
              <div className="space-y-3 p-4">
                <label className="block text-xs font-bold text-[#4c5e57]">
                  Alt text
                  <input
                    value={image.altText}
                    onChange={(event) => refreshRecord(image.id, { altText: event.target.value })}
                    maxLength={180}
                    className="mt-1 min-h-11 w-full rounded-lg border border-[#d8d2c5] px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]"
                  />
                </label>
                <label className="block text-xs font-bold text-[#4c5e57]">
                  Display order
                  <input type="number" min={0} value={image.displayOrder} onChange={(event) => refreshRecord(image.id, { displayOrder: Math.max(0, Number(event.target.value)) })} className="mt-1 min-h-11 w-full rounded-lg border border-[#d8d2c5] px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]" />
                </label>
                {colorVariants.length > 0 && (
                  <label className="block text-xs font-bold text-[#4c5e57]">
                    Color association
                    <select
                      value={image.colorVariantId ?? ""}
                      onChange={(event) => refreshRecord(image.id, { colorVariantId: event.target.value || null })}
                      className="mt-1 min-h-11 w-full rounded-lg border border-[#d8d2c5] px-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]"
                    >
                      <option value="">All colors</option>
                      {colorVariants.map((variant) => <option key={variant.id} value={variant.id}>{variant.label}</option>)}
                    </select>
                  </label>
                )}
                <label className="flex min-h-11 items-center gap-2 text-sm font-semibold text-[#354941]">
                  <input type="checkbox" checked={image.isActive} onChange={(event) => refreshRecord(image.id, { isActive: event.target.checked })} className="h-5 w-5 accent-[#176342]" />
                  Active on storefront
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" disabled={pending || image.isFeatured} onClick={() => startTransition(async () => {
                    const result = await updateProductImage({ id: image.id, altText: image.altText, colorVariantId: image.colorVariantId, isActive: image.isActive, isFeatured: true, displayOrder: image.displayOrder });
                    setMessage(result.message);
                    if (result.ok) setImages((current) => current.map((item) => ({ ...item, isFeatured: item.id === image.id })));
                  })} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[#d8d2c5] text-[#6d5724] hover:bg-[#faf5e8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c] disabled:opacity-50" aria-label={`Make ${image.altText || "image"} featured`}><Star className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" disabled={pending} onClick={() => startTransition(async () => {
                    const result = await updateProductImage({ id: image.id, altText: image.altText, colorVariantId: image.colorVariantId, isActive: image.isActive, isFeatured: image.isFeatured, displayOrder: image.displayOrder });
                    setMessage(result.message);
                  })} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#e3f2eb] text-[#176342] hover:bg-[#d5ebe0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176342]" aria-label={`Save ${image.altText || "image"}`}><Check className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" disabled={pending} onClick={() => startTransition(async () => {
                    const result = await deleteProductImage(image.id);
                    setMessage(result.message);
                    if (result.ok) {
                      setImages((current) => {
                        const remaining = current.filter((item) => item.id !== image.id);
                        if (image.isFeatured && remaining.length) remaining[0] = { ...remaining[0], isFeatured: true };
                        return remaining;
                      });
                    }
                  })} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#fff0ed] text-[#9a3d2e] hover:bg-[#ffe3dd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a3d2e]" aria-label={`Delete ${image.altText || "image"}`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
