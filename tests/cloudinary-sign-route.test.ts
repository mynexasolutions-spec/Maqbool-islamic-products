import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ reject: false }));

vi.mock("@/lib/admin-authorization", () => {
  class AdminAuthorizationError extends Error {}
  return {
    AdminAuthorizationError,
    requireAdmin: vi.fn(async () => {
      if (auth.reject) throw new AdminAuthorizationError("Unauthorized");
      return { sub: "admin" };
    }),
  };
});

vi.mock("@/lib/cloudinary/server", () => ({
  signCloudinaryParameters: vi.fn(() => "signed-value"),
}));

import { POST } from "@/app/api/cloudinary/sign/route";

describe("Cloudinary signing route", () => {
  beforeEach(() => {
    auth.reject = false;
  });

  it("rejects a request without a valid Maqbool admin session", async () => {
    auth.reject = true;
    const response = await POST(new Request("https://maqbool.test/api/cloudinary/sign?scope=product", {
      method: "POST",
      body: JSON.stringify({ paramsToSign: {} }),
    }));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Unauthorized" });
  });

  it("returns only the signature for an allowed signed upload", async () => {
    const timestamp = Math.floor(Date.now() / 1_000);
    const response = await POST(new Request("https://maqbool.test/api/cloudinary/sign?scope=hero", {
      method: "POST",
      body: JSON.stringify({
        paramsToSign: {
          timestamp,
          folder: "maqbool/hero",
          resource_type: "image",
          max_file_size: 10 * 1024 * 1024,
          allowed_formats: "jpg,png,webp",
        },
      }),
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ signature: "signed-value" });
  });

  it("rejects an unknown scope before signing", async () => {
    const response = await POST(new Request("https://maqbool.test/api/cloudinary/sign?scope=avatar", {
      method: "POST",
      body: JSON.stringify({ paramsToSign: { timestamp: Math.floor(Date.now() / 1_000) } }),
    }));
    expect(response.status).toBe(400);
  });
});
