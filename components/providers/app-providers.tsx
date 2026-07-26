"use client";

import { CartProvider } from "./cart-provider";
import { CustomerProvider } from "./customer-provider";
import { ToastProvider } from "./toast-provider";
import { MarketProvider } from "./market-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CustomerProvider>
        <MarketProvider>
          <CartProvider>{children}</CartProvider>
        </MarketProvider>
      </CustomerProvider>
    </ToastProvider>
  );
}
