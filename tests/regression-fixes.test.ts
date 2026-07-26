import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { formatAdminDate, formatAdminDateTime } from "@/lib/date-format";
import {
  displayPhone,
  isValidMarketPhone,
  nationalPhoneDigits,
  toInternationalPhone,
} from "@/lib/phone";

describe("market-aware customer phones", () => {
  it("validates and normalizes each supported market", () => {
    expect(toInternationalPhone("9876543210", "in")).toBe("+919876543210");
    expect(toInternationalPhone("551234567", "sa")).toBe("+966551234567");
    expect(toInternationalPhone("501234567", "dubai")).toBe("+971501234567");
    expect(toInternationalPhone("123456789", "my")).toBe("+60123456789");
    expect(toInternationalPhone("55123456", "qa")).toBe("+97455123456");
    expect(isValidMarketPhone("551234567", "sa")).toBe(true);
    expect(isValidMarketPhone("9876543210", "sa")).toBe(false);
  });

  it("supports stored international values and legacy national values", () => {
    expect(nationalPhoneDigits("+966551234567", "sa")).toBe("551234567");
    expect(displayPhone("+966551234567", "sa")).toBe("+966551234567");
    expect(displayPhone("9876543210", "in")).toBe("+91 9876543210");
  });
});

describe("deterministic admin dates", () => {
  it("renders the same explicit locale and timezone on server and client", () => {
    const value = "2026-07-26T15:40:37.000Z";
    expect(formatAdminDate(value)).toBe("26/07/2026");
    expect(formatAdminDateTime(value)).toBe("26/07/2026, 21:10:37");
  });
});

describe("regression migration", () => {
  const sql = readFileSync("supabase/migrations/20260730000000_regression_fixes.sql", "utf8");

  it("adds a protected inquiry workflow", () => {
    expect(sql).toContain("add column if not exists status");
    expect(sql).toContain("contact_messages_status_check");
    expect(sql).toContain("revoke select, update, delete on public.contact_messages from anon, authenticated");
  });

  it("fills missing prices without overwriting admin-entered offers", () => {
    expect(sql).toContain("market.slug in ('sa', 'dubai', 'my', 'qa')");
    expect(sql).toContain("on conflict (variant_id, market_id) do nothing");
  });
});
