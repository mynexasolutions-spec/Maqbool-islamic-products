"use client";

import { CartProvider } from "./cart-provider";
import { CustomerProvider } from "./customer-provider";
import { ToastProvider } from "./toast-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <CustomerProvider>
        <CartProvider>{children}</CartProvider>
      </CustomerProvider>
    </ToastProvider>
  );
}

