import type { CartItem, PaymentMethod } from "@/lib/models";

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

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

