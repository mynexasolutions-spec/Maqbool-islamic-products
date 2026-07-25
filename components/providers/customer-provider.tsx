"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Address, CustomerSession, MockOrder } from "@/lib/models";
import { readStorage, STORAGE_KEYS, writeStorage } from "@/lib/storage";

type CustomerContextValue = {
  customer: CustomerSession | null;
  addresses: Address[];
  orders: MockOrder[];
  login: (name: string, phone: string) => void;
  logout: () => void;
  saveAddress: (address: Address) => void;
  removeAddress: (id: string) => void;
  addOrder: (order: MockOrder) => void;
};
const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CustomerProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerSession | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<MockOrder[]>([]);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setCustomer(readStorage(STORAGE_KEYS.customer, null));
    setAddresses(readStorage(STORAGE_KEYS.addresses, []));
    setOrders(readStorage(STORAGE_KEYS.orders, []));
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) writeStorage(STORAGE_KEYS.customer, customer); }, [customer, hydrated]);
  useEffect(() => { if (hydrated) writeStorage(STORAGE_KEYS.addresses, addresses); }, [addresses, hydrated]);
  useEffect(() => { if (hydrated) writeStorage(STORAGE_KEYS.orders, orders); }, [orders, hydrated]);

  const value = useMemo<CustomerContextValue>(() => ({
    customer,
    addresses,
    orders,
    login: (name, phone) => setCustomer({ name, phone, verifiedAt: new Date().toISOString() }),
    logout: () => setCustomer(null),
    saveAddress: (address) => setAddresses((current) => {
      const exists = current.some((item) => item.id === address.id);
      return exists ? current.map((item) => item.id === address.id ? address : item) : [...current, address];
    }),
    removeAddress: (id) => setAddresses((current) => current.filter((address) => address.id !== id)),
    addOrder: (order) => setOrders((current) => [order, ...current]),
  }), [addresses, customer, orders]);
  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const value = useContext(CustomerContext);
  if (!value) throw new Error("useCustomer must be used within CustomerProvider");
  return value;
}

