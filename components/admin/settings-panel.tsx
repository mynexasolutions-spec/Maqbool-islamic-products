"use client";

import { useState } from "react";
import { RotateCcw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { useAdminStore } from "./admin-store";
import { AdminPageHeader, AdminPanel } from "./admin-ui";

export function SettingsPanel() {
  const { resetDemo } = useAdminStore();
  const [confirming, setConfirming] = useState(false);
  const [message, setMessage] = useState("");
  return <><div role="status" aria-live="polite" className="sr-only">{message}</div><AdminPageHeader eyebrow="Workspace" title="Settings" description="Review Part 1 workspace behaviour and restore the local demo dataset." /><div className="grid gap-5 lg:grid-cols-2"><AdminPanel className="p-6"><span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#e4f1eb] text-[#176342]"><ShieldCheck className="h-5 w-5" /></span><h2 className="font-heading text-xl text-[#123d32]">Secure admin session</h2><p className="mt-2 text-sm leading-6 text-[#65736d]">Credentials are validated server-side. The protected session uses an HTTP-only cookie and expires after eight hours.</p><p className="mt-4 inline-flex rounded-full bg-[#eeeae1] px-3 py-1 text-xs font-bold text-[#6f6656]">Environment managed</p></AdminPanel><AdminPanel className="p-6"><span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-[#fff0ed] text-[#9a3d2e]"><RotateCcw className="h-5 w-5" /></span><h2 className="font-heading text-xl text-[#123d32]">Reset demo data</h2><p className="mt-2 text-sm leading-6 text-[#65736d]">Restore products, categories, orders, and customers to their original Part 1 fixtures.</p><Button variant="outline" onClick={() => setConfirming(true)} className="mt-5 min-h-11 border-[#c98879] text-[#8d3426] hover:bg-[#fff2ef]">Reset local data</Button></AdminPanel></div><Dialog open={confirming} onClose={() => setConfirming(false)} title="Reset all demo data?"><p className="text-sm leading-6 text-[#65736d]">All local admin edits will be replaced by the original demo fixtures. This cannot be undone.</p><div className="mt-6 flex justify-end gap-3"><Button variant="outline" onClick={() => setConfirming(false)}>Cancel</Button><Button className="bg-[#9a3d2e] hover:bg-[#7d3024]" onClick={() => { resetDemo(); setConfirming(false); setMessage("Admin demo data was reset."); }}>Reset data</Button></div></Dialog></>;
}
