"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem } from "@/lib/models";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";
import { useMarket } from "./market-provider";

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  addItem: (item: CartItem) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { marketSlug, market } = useMarket();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    const stored = readStorage<CartItem[]>(STORAGE_KEYS.cart, []);
    setItems(stored.filter((item) => !item.marketSlug || item.marketSlug === marketSlug));
    setHydrated(true);
  }, [marketSlug]);
  useEffect(() => {
    if (hydrated) writeStorage(STORAGE_KEYS.cart, items);
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    isOpen,
    setOpen,
    addItem: (next) => {
      const normalized = { ...next, marketSlug, currencyCode: market.currencyCode };
      setItems((current) => {
        const sameMarket = current.filter((item) => !item.marketSlug || item.marketSlug === marketSlug);
        const existing = sameMarket.find((item) => item.id === normalized.id);
        if (!existing) return [...sameMarket, { ...normalized, quantity: Math.min(normalized.quantity, normalized.stock) }];
        return sameMarket.map((item) => item.id === normalized.id
          ? { ...item, quantity: Math.min(item.quantity + normalized.quantity, item.stock), marketSlug, currencyCode: market.currencyCode }
          : item);
      });
      setOpen(true);
    },
    updateQuantity: (id, quantity) => setItems((current) => current.map((item) =>
      item.id === id ? { ...item, quantity: Math.max(1, Math.min(quantity, item.stock)) } : item)),
    removeItem: (id) => setItems((current) => current.filter((item) => item.id !== id)),
    clear: () => setItems([]),
  }), [isOpen, items, market.currencyCode, marketSlug]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used within CartProvider");
  return value;
}
