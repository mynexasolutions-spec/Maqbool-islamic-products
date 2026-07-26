"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, Mail, Search, Trash2 } from "lucide-react";
import {
  deleteInquiry,
  updateInquiry,
  type AdminInquiry,
  type InquiryStatus,
} from "@/app/admin/inquiries/actions";
import { formatAdminDate, formatAdminDateTime } from "@/lib/date-format";
import { AdminPageHeader, AdminPanel, EmptyAdminState, StatusPill } from "./admin-ui";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

const statuses: InquiryStatus[] = ["new", "open", "resolved"];

export function InquiryManager({ initialInquiries }: { initialInquiries: AdminInquiry[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<AdminInquiry | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const filtered = useMemo(() => initialInquiries.filter((inquiry) => {
    const matchesQuery = `${inquiry.fullName} ${inquiry.email} ${inquiry.phone ?? ""} ${inquiry.orderId ?? ""} ${inquiry.subject} ${inquiry.message}`
      .toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "all" || inquiry.status === filter);
  }), [filter, initialInquiries, query]);

  function save() {
    if (!selected) return;
    setError("");
    startTransition(async () => {
      const result = await updateInquiry({ id: selected.id, status: selected.status, adminNote: selected.adminNote });
      if (!result.ok) setError(result.error);
      else {
        setSelected(null);
        setMessage(result.message);
        router.refresh();
      }
    });
  }

  function remove(inquiry: AdminInquiry) {
    if (!window.confirm(`Delete the inquiry from ${inquiry.fullName}?`)) return;
    setError("");
    startTransition(async () => {
      const result = await deleteInquiry(inquiry.id);
      if (!result.ok) setError(result.error);
      else {
        setSelected(null);
        setMessage(result.message);
        router.refresh();
      }
    });
  }

  return (
    <>
      <AdminPageHeader eyebrow="Support" title="Inquiries" description="Review customer messages submitted through the storefront contact form." />
      <p className="mb-4 min-h-5 text-sm font-semibold text-[#176342]" role="status">{message}</p>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
      <AdminPanel>
        <div className="grid gap-3 border-b p-4 md:grid-cols-[1fr_220px]">
          <label className="relative"><span className="sr-only">Search inquiries</span><Search className="absolute left-3 top-3 h-4 w-4 text-[#718079]" /><Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Customer, email, order or message…" /></label>
          <label><span className="sr-only">Filter inquiries</span><Select className="w-full" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></label>
        </div>
        {filtered.length ? (
          <Table>
            <thead className="bg-[#f8f6f0] text-xs uppercase text-[#69766f]"><tr><th className="px-5 py-3">Customer</th><th className="px-4 py-3">Subject</th><th className="px-4 py-3">Received</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y">{filtered.map((inquiry) => (
              <tr key={inquiry.id}>
                <td className="px-5 py-4"><p className="font-bold">{inquiry.fullName}</p><p className="text-xs text-[#74807b]">{inquiry.email}</p></td>
                <td className="px-4 py-4"><p className="font-semibold">{inquiry.subject}</p>{inquiry.orderId && <p className="text-xs text-[#74807b]">Order {inquiry.orderId}</p>}</td>
                <td className="px-4 py-4 text-xs">{formatAdminDate(inquiry.createdAt)}</td>
                <td className="px-4 py-4"><StatusPill active={inquiry.status !== "resolved"} label={inquiry.status} /></td>
                <td className="px-5 py-4"><div className="flex justify-end gap-1"><button className="grid min-h-11 min-w-11 place-items-center rounded-lg hover:bg-[#e8f0ec]" aria-label={`View inquiry from ${inquiry.fullName}`} onClick={() => setSelected(inquiry)}><Eye className="h-4 w-4" /></button><button className="grid min-h-11 min-w-11 place-items-center rounded-lg text-red-700 hover:bg-red-50" aria-label={`Delete inquiry from ${inquiry.fullName}`} onClick={() => remove(inquiry)}><Trash2 className="h-4 w-4" /></button></div></td>
              </tr>
            ))}</tbody>
          </Table>
        ) : <EmptyAdminState title="No inquiries found" description="New contact-form submissions will appear here." />}
      </AdminPanel>
      <Dialog open={Boolean(selected)} onClose={() => !pending && setSelected(null)} title={selected ? `Inquiry from ${selected.fullName}` : "Inquiry"}>
        {selected && (
          <div className="space-y-5 text-sm">
            <div className="rounded-lg bg-[#f7f5ee] p-4"><p className="flex items-center gap-2 font-bold text-[#123d32]"><Mail className="h-4 w-4" />{selected.email}</p>{selected.phone && <p className="mt-1">{selected.phone}</p>}{selected.orderId && <p className="mt-1">Order: {selected.orderId}</p>}<p className="mt-2 text-xs text-[#718079]">{formatAdminDateTime(selected.createdAt)}</p></div>
            <div><p className="font-bold text-[#123d32]">{selected.subject}</p><p className="mt-2 whitespace-pre-wrap leading-6">{selected.message}</p></div>
            <label className="block font-semibold">Status<Select className="mt-2 w-full" value={selected.status} onChange={(event) => setSelected({ ...selected, status: event.target.value as InquiryStatus })}>{statuses.map((status) => <option key={status}>{status}</option>)}</Select></label>
            <label className="block font-semibold">Internal note<Textarea className="mt-2 min-h-28 font-normal" value={selected.adminNote} onChange={(event) => setSelected({ ...selected, adminNote: event.target.value })} placeholder="Add a private follow-up note…" /></label>
            <div className="flex justify-end gap-3"><Button type="button" variant="outline" onClick={() => setSelected(null)}>Cancel</Button><Button type="button" disabled={pending} onClick={save}>{pending ? "Saving…" : "Save inquiry"}</Button></div>
          </div>
        )}
      </Dialog>
    </>
  );
}
