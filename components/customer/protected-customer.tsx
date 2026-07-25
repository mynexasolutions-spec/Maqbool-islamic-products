"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useCustomer } from "@/components/providers/customer-provider";
import { readStorage, STORAGE_KEYS } from "@/lib/storage";
import type { CustomerSession } from "@/lib/models";

export function ProtectedCustomer({ children }: { children: React.ReactNode }) {
  const { customer } = useCustomer();
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readStorage<CustomerSession | null>(STORAGE_KEYS.customer, null);
    if (!customer && !stored) {
      router.replace(`/login?returnTo=${encodeURIComponent(pathname)}`);
      return;
    }
    setReady(true);
  }, [customer, pathname, router]);

  if (!ready || !customer) {
    return (
      <main className="site-container grid min-h-[45vh] place-items-center" aria-busy="true">
        <p className="flex items-center gap-2 text-sm text-muted">
          <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
          Checking your account…
        </p>
      </main>
    );
  }

  return <>{children}</>;
}
