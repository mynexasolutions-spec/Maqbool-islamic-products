"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export function Dialog({ open, onClose, title, children }: {
  open: boolean;
  onClose: () => void;
  title: string;
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
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/45 p-4" role="presentation" onMouseDown={onClose}>
      <section className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-xl bg-white p-6 shadow-2xl" role="dialog" aria-modal="true" aria-labelledby="dialog-title" onMouseDown={(event) => event.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <h2 id="dialog-title" className="font-heading text-2xl text-forest">{title}</h2>
          <button ref={closeRef} onClick={onClose} aria-label="Close dialog"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </section>
    </div>
  );
}
