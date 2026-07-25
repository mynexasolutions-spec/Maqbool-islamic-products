"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Drawer({ open, onClose, title, side = "right", children }: {
  open: boolean;
  onClose: () => void;
  title: string;
  side?: "left" | "right";
  children: React.ReactNode;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    window.setTimeout(() => closeRef.current?.focus(), 0);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);
  return (
    <div className={cn("fixed inset-0 z-[90]", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <button className={cn("absolute inset-0 bg-black/40 transition-opacity", open ? "opacity-100" : "opacity-0")} onClick={onClose} aria-label="Close drawer" />
      <section className={cn("absolute top-0 h-full w-[min(92vw,420px)] overflow-auto bg-white p-5 shadow-2xl transition-transform", side === "right" ? "right-0" : "left-0", open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full")} role="dialog" aria-modal="true" aria-label={title}>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-heading text-2xl text-forest">{title}</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Close drawer"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </section>
    </div>
  );
}
