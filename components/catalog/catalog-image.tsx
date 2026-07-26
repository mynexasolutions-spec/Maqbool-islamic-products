"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

export function CatalogImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-cream text-muted" role="img" aria-label={`${alt} — image unavailable`}>
        <ImageOff className="h-7 w-7 text-gold" aria-hidden="true" />
        <span className="text-xs">Image unavailable</span>
      </div>
    );
  }
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} onError={() => setFailed(true)} />;
}
