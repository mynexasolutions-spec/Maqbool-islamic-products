"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, MapPin, Package, UserRound } from "lucide-react";
import { useCustomer } from "@/components/providers/customer-provider";
import { useToast } from "@/components/providers/toast-provider";

const links = [
  { href: "/profile", label: "Account", icon: UserRound },
  { href: "/profile#addresses", label: "Addresses", icon: MapPin },
  { href: "/profile/orders", label: "Orders", icon: Package },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { customer, logout } = useCustomer();
  const { toast } = useToast();

  return (
    <div className="site-container grid gap-8 py-12 lg:grid-cols-[260px_1fr]">
      <aside className="h-fit overflow-hidden rounded-xl border border-[#e8ddc8] bg-white">
        <div className="bg-forest p-6 text-white">
          <span className="mb-3 grid h-11 w-11 place-items-center rounded-full bg-white/10"><UserRound className="h-5 w-5" aria-hidden="true" /></span>
          <p className="font-heading text-xl">{customer?.name}</p>
          <p className="mt-1 text-xs text-[#d4e2dc]">+91 {customer?.phone}</p>
        </div>
        <nav className="p-3" aria-label="Account navigation">
          {links.map(({ href, label, icon: Icon }) => {
            const basePath = href.split("#")[0];
            const active = label === "Orders" ? pathname.startsWith("/profile/orders") : pathname === basePath;
            return (
              <Link key={label} href={href} aria-current={active ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold ${active ? "bg-cream text-forest" : "text-muted hover:bg-cream/60 hover:text-forest"}`}>
                <Icon className="h-4 w-4 text-gold" aria-hidden="true" /> {label}
              </Link>
            );
          })}
          <button type="button" onClick={() => { logout(); toast("You have been logged out."); router.replace("/"); }} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-muted hover:bg-red-50 hover:text-red-800">
            <LogOut className="h-4 w-4" aria-hidden="true" /> Log out
          </button>
        </nav>
      </aside>
      <section className="min-w-0">{children}</section>
    </div>
  );
}
