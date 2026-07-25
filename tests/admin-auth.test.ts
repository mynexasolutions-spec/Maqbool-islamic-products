import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { POST as login } from "@/app/api/admin/login/route";
import { createAdminSession, verifyAdminSession } from "@/lib/admin-auth";

describe("admin authentication", () => {
  beforeEach(() => {
    process.env.ADMIN_ID = "administrator";
    process.env.ADMIN_PASSWORD = "correct-horse";
    process.env.ADMIN_SESSION_SECRET = "a-test-secret-that-is-long-enough-for-hs256";
  });

  afterEach(() => {
    delete process.env.ADMIN_ID;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_SESSION_SECRET;
  });

  it("signs and verifies an eight-hour admin token", async () => {
    const token = await createAdminSession("administrator");
    const payload = await verifyAdminSession(token);
    expect(payload?.sub).toBe("administrator");
    expect(payload?.role).toBe("admin");
  });

  it("rejects invalid credentials with a generic error", async () => {
    const response = await login(new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ adminId: "administrator", password: "wrong" }),
      headers: { "content-type": "application/json", "x-forwarded-for": "test-invalid" },
    }));
    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({ error: "Invalid credentials." });
  });

  it("sets an HTTP-only strict cookie after valid credentials", async () => {
    const response = await login(new NextRequest("http://localhost/api/admin/login", {
      method: "POST",
      body: JSON.stringify({ adminId: "administrator", password: "correct-horse" }),
      headers: { "content-type": "application/json", "x-forwarded-for": "test-valid" },
    }));
    expect(response.status).toBe(200);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain("maqbool_admin_session=");
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=strict");
  });
});
