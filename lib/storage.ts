export const STORAGE_KEYS = {
  cart: "maqbool_cart",
  customer: "maqbool_customer",
  addresses: "maqbool_addresses",
  orders: "maqbool_orders",
  adminDemo: "maqbool_admin_demo",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

