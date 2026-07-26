"use client";

import { ImagePlus, LoaderCircle } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { useState } from "react";
import type { CloudinaryScope } from "@/lib/cloudinary/scopes";
import {
  CLOUDINARY_ALLOWED_FORMATS,
  CLOUDINARY_MAX_IMAGE_BYTES,
  CLOUDINARY_SCOPES,
} from "@/lib/cloudinary/scopes";
import type { CloudinaryUploadAsset } from "@/lib/cloudinary/types";
import { cn } from "@/lib/utils";

type UploadInfo = {
  secure_url?: unknown;
  public_id?: unknown;
  resource_type?: unknown;
  format?: unknown;
  width?: unknown;
  height?: unknown;
  bytes?: unknown;
};

function toAsset(info: unknown): CloudinaryUploadAsset | null {
  if (!info || typeof info !== "object") return null;
  const value = info as UploadInfo;
  if (
    typeof value.secure_url !== "string" ||
    typeof value.public_id !== "string" ||
    value.resource_type !== "image" ||
    typeof value.format !== "string" ||
    typeof value.width !== "number" ||
    typeof value.height !== "number" ||
    typeof value.bytes !== "number"
  ) return null;
  return {
    secureUrl: value.secure_url,
    publicId: value.public_id,
    resourceType: "image",
    format: value.format,
    width: value.width,
    height: value.height,
    bytes: value.bytes,
  };
}

export function CloudinaryUploadButton({
  scope,
  onUploaded,
  disabled,
  label = "Upload image",
  className,
}: {
  scope: CloudinaryScope;
  onUploaded: (asset: CloudinaryUploadAsset) => void | Promise<void>;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  return (
    <div>
      <CldUploadWidget
        signatureEndpoint={`/api/cloudinary/sign?scope=${scope}`}
        options={{
          clientAllowedFormats: [...CLOUDINARY_ALLOWED_FORMATS],
          folder: CLOUDINARY_SCOPES[scope],
          maxFileSize: CLOUDINARY_MAX_IMAGE_BYTES,
          maxFiles: 1,
          multiple: false,
          resourceType: "image",
          sources: ["local", "camera"],
        }}
        onSuccess={async (result) => {
          const asset = toAsset(result.info);
          if (!asset) {
            setError("Cloudinary returned incomplete image metadata.");
            return;
          }
          setProcessing(true);
          setError("");
          try {
            await onUploaded(asset);
          } finally {
            setProcessing(false);
          }
        }}
        onError={() => setError("The image upload did not complete. Please try again.")}
      >
        {({ open }) => (
          <button
            type="button"
            disabled={disabled || processing}
            aria-busy={processing}
            onClick={() => open()}
            className={cn(
              "inline-flex min-h-11 items-center justify-center rounded-lg bg-[#123d32] px-4 text-sm font-bold text-white transition hover:bg-[#1a5445] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60",
              className,
            )}
          >
            {processing
              ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden="true" />
              : <ImagePlus className="mr-2 h-4 w-4" aria-hidden="true" />}
            {processing ? "Saving image…" : label}
          </button>
        )}
      </CldUploadWidget>
      {error && <p role="alert" className="mt-2 text-sm font-medium text-[#9a3d2e]">{error}</p>}
    </div>
  );
}
