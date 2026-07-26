import { describe, expect, it } from "vitest";
import { normalizeSigningParams, validateSigningParams } from "@/lib/cloudinary/signing-policy";

const now = 1_800_000_000;
const valid = {
  timestamp: now,
  folder: "maqbool/products",
  resource_type: "image",
  type: "upload",
  allowed_formats: "jpg,png,webp",
  max_file_size: 10 * 1024 * 1024,
};

describe("Cloudinary signing policy", () => {
  it("accepts constrained product image uploads", () => {
    expect(validateSigningParams("product", valid, now)).toBeNull();
  });

  it("rejects folder and resource type escalation", () => {
    expect(validateSigningParams("hero", valid, now)).toMatch(/destination/i);
    expect(validateSigningParams("product", { ...valid, resource_type: "raw" }, now)).toMatch(/destination/i);
  });

  it("rejects unsupported formats, oversized files, and stale timestamps", () => {
    expect(validateSigningParams("product", { ...valid, allowed_formats: "svg" }, now)).toMatch(/format/i);
    expect(validateSigningParams("product", { ...valid, max_file_size: 10 * 1024 * 1024 + 1 }, now)).toMatch(/size/i);
    expect(validateSigningParams("product", { ...valid, timestamp: now - 901 }, now)).toMatch(/expired/i);
  });

  it("normalizes only bounded scalar signing parameters", () => {
    expect(normalizeSigningParams({ timestamp: now, folder: "maqbool/products" })).toEqual({ timestamp: now, folder: "maqbool/products" });
    expect(normalizeSigningParams({ timestamp: { nested: true } })).toBeNull();
    expect(normalizeSigningParams([])).toBeNull();
  });
});
