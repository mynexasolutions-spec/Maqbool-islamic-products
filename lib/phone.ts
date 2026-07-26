import type { MarketSlug } from "@/lib/markets";

type PhoneRule = {
  callingCode: string;
  example: string;
  minLength: number;
  maxLength: number;
  pattern?: RegExp;
};

export const MARKET_PHONE_RULES: Record<MarketSlug, PhoneRule> = {
  in: { callingCode: "+91", example: "98765 43210", minLength: 10, maxLength: 10, pattern: /^[6-9]\d{9}$/ },
  sa: { callingCode: "+966", example: "55 123 4567", minLength: 9, maxLength: 9, pattern: /^5\d{8}$/ },
  dubai: { callingCode: "+971", example: "50 123 4567", minLength: 9, maxLength: 9, pattern: /^5\d{8}$/ },
  my: { callingCode: "+60", example: "12 345 6789", minLength: 9, maxLength: 10, pattern: /^1\d{8,9}$/ },
  qa: { callingCode: "+974", example: "5512 3456", minLength: 8, maxLength: 8, pattern: /^[3567]\d{7}$/ },
};

export function nationalPhoneDigits(value: string, market: MarketSlug) {
  const digits = value.replace(/\D/g, "");
  const callingDigits = MARKET_PHONE_RULES[market].callingCode.slice(1);
  return value.trim().startsWith("+") && digits.startsWith(callingDigits)
    ? digits.slice(callingDigits.length)
    : digits;
}

export function isValidMarketPhone(value: string, market: MarketSlug) {
  const digits = nationalPhoneDigits(value, market);
  const rule = MARKET_PHONE_RULES[market];
  return digits.length >= rule.minLength
    && digits.length <= rule.maxLength
    && (!rule.pattern || rule.pattern.test(digits));
}

export function toInternationalPhone(value: string, market: MarketSlug) {
  return `${MARKET_PHONE_RULES[market].callingCode}${nationalPhoneDigits(value, market)}`;
}

export function displayPhone(value: string, fallbackMarket: MarketSlug = "in") {
  const trimmed = value.trim();
  if (trimmed.startsWith("+")) return trimmed;
  return `${MARKET_PHONE_RULES[fallbackMarket].callingCode} ${trimmed}`;
}
