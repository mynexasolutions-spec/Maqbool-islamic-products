"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminId: form.get("id"), password: form.get("password") }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        throw new Error(body?.error || "The administrator ID or password is incorrect.");
      }
      const returnTo = new URLSearchParams(window.location.search).get("returnTo");
      router.replace(returnTo?.startsWith("/admin") && returnTo !== "/admin/login" ? returnTo : "/admin");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#f4f0e5] lg:grid-cols-[1.1fr_.9fr]">
      <div className="pointer-events-none absolute inset-0 opacity-[.18]" aria-hidden="true" style={{ backgroundImage: "radial-gradient(#987326 0.7px, transparent 0.7px)", backgroundSize: "18px 18px" }} />
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-[#123d32] p-12 text-white lg:flex">
        <div className="absolute -right-32 -top-28 h-[30rem] w-[30rem] rounded-full border-[80px] border-[#d5b56d]/10" aria-hidden="true" />
        <div className="absolute -bottom-44 -left-44 h-[35rem] w-[35rem] rotate-12 rounded-[7rem] border-[90px] border-white/[.035]" aria-hidden="true" />
        <div className="relative flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#d5b56d] text-[#123d32]"><ShieldCheck className="h-6 w-6" /></span>
          <div><p className="font-heading text-2xl">Maqbool</p><p className="text-[10px] uppercase tracking-[.28em] text-[#b8ccc5]">Administration</p></div>
        </div>
        <div className="relative max-w-xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[.24em] text-[#d5b56d]">The operations room</p>
          <h1 className="font-heading text-5xl leading-[1.12]">Care for every order, from shelf to doorstep.</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-[#c6d7d1]">Manage Maqbool&apos;s catalog, customers, and fulfilment from one calm, focused workspace.</p>
        </div>
        <p className="relative text-xs text-[#92afa5]">Authorised personnel only · Sessions expire after 8 hours</p>
      </section>
      <section className="relative flex min-h-screen items-center justify-center p-5 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#123d32] text-[#d5b56d]"><ShieldCheck className="h-5 w-5" /></span>
            <div><p className="font-heading text-xl text-[#123d32]">Maqbool</p><p className="text-[9px] uppercase tracking-[.24em] text-[#65746e]">Administration</p></div>
          </div>
          <div className="rounded-[1.5rem] border border-[#ddd5c4] bg-white p-6 shadow-[0_26px_80px_rgba(35,61,51,.12)] sm:p-9">
            <div className="mb-7">
              <span className="mb-5 grid h-11 w-11 place-items-center rounded-xl bg-[#eee8d9] text-[#987326]"><KeyRound className="h-5 w-5" /></span>
              <h2 className="font-heading text-3xl text-[#123d32]">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-[#67736e]">Use your secure administrator credentials to continue.</p>
            </div>
            {error && <div role="alert" className="mb-5 rounded-lg border border-[#e8b9af] bg-[#fff3f0] px-4 py-3 text-sm text-[#8c2e20]">{error}</div>}
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="admin-id" className="mb-2 block text-sm font-bold text-[#2a4038]">Administrator ID</label>
                <Input id="admin-id" name="id" autoComplete="username" required aria-required="true" className="h-12 bg-[#fcfbf8]" placeholder="Enter administrator ID" />
              </div>
              <div>
                <label htmlFor="admin-password" className="mb-2 block text-sm font-bold text-[#2a4038]">Password</label>
                <div className="relative">
                  <Input id="admin-password" name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" required aria-required="true" className="h-12 bg-[#fcfbf8] pr-12" placeholder="Enter password" />
                  <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 grid min-w-12 place-items-center rounded-r-md text-[#52635c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]" aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              <Button type="submit" disabled={loading} className="h-12 w-full bg-[#123d32] text-base hover:bg-[#1a5445]">
                {loading && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                {loading ? "Signing in…" : "Sign in securely"}
              </Button>
            </form>
          </div>
          <p className="mt-6 text-center text-xs leading-5 text-[#68756f]">Credentials are verified securely on the server. They are never stored in this browser.</p>
        </div>
      </section>
    </main>
  );
}
