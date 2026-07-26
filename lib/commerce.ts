import type { CartItem, PaymentMethod } from "@/lib/models";
import { formatMoney, type MarketSlug } from "@/lib/markets";
import type { MarketCheckoutSettings } from "@/components/providers/market-provider";

export const SHIPPING_FEE = 79;
export const FREE_SHIPPING_THRESHOLD = 999;
export const COD_CHARGE = 39;
export const COUPON_CODE = "MAQBOOL10";

export function calculateCheckout(
  items: CartItem[],
  coupon: string,
  paymentMethod: PaymentMethod,
) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FEE;
  const discount = coupon.trim().toUpperCase() === COUPON_CODE ? Math.round(subtotal * 0.1) : 0;
  const codCharge = paymentMethod === "cod" && subtotal > 0 ? COD_CHARGE : 0;
  return { subtotal, shipping, discount, codCharge, total: subtotal + shipping + codCharge - discount };
}

export function formatPrice(value: number, market: MarketSlug = "in") {
  return formatMoney(value, market);
}

export function calculateMarketCheckout(
  items: CartItem[],
  coupon: string,
  paymentMethod: PaymentMethod,
  settings: MarketCheckoutSettings | null,
) {
  if (!settings) return { subtotal: 0, shipping: 0, discount: 0, tax: 0, codCharge: 0, total: 0 };
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = coupon.trim().toUpperCase() === COUPON_CODE ? Math.round(subtotal * 0.1 * 100) / 100 : 0;
  const shipping = subtotal > 0 && (settings.freeShippingThreshold === null || subtotal - discount < settings.freeShippingThreshold)
    ? settings.shippingFee
    : 0;
  const taxable = subtotal - discount + (settings.taxAppliesToShipping ? shipping : 0);
  const tax = Math.round(taxable * settings.taxRate) / 100;
  const codCharge = paymentMethod === "cod" && subtotal > 0 ? settings.codFee : 0;
  return { subtotal, shipping, discount, tax, codCharge, total: subtotal - discount + shipping + tax + codCharge };
}
