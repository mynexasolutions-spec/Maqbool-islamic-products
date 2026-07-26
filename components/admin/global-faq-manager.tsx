"use client";

import { Check, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { createGlobalFaq, deleteGlobalFaq, updateGlobalFaq } from "@/app/admin/faqs/actions";
import type { GlobalFaqRecord } from "@/lib/cloudinary/types";
import { AdminPageHeader, AdminPanel } from "./admin-ui";

const fieldClass = "min-h-11 w-full rounded-lg border border-[#d8d2c5] bg-white px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]";

export function GlobalFaqManager({ initialFaqs }: { initialFaqs: GlobalFaqRecord[] }) {
  const [faqs, setFaqs] = useState(initialFaqs);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <>
      <AdminPageHeader eyebrow="Storefront" title="Global FAQs" description="Manage the questions shown in the homepage FAQ section." />
      <p role="status" aria-live="polite" className="mb-5 min-h-5 text-sm font-semibold text-[#176342]">{message}</p>
      <AdminPanel className="mb-7 p-5 sm:p-6">
        <h2 className="font-heading text-xl text-[#123d32]">Add a question</h2>
        <div className="mt-4 grid gap-4">
          <label className="text-sm font-bold text-[#2a4038]">Question<input value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={240} className={`mt-1.5 ${fieldClass}`} /></label>
          <label className="text-sm font-bold text-[#2a4038]">Answer<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} maxLength={2000} rows={4} className="mt-1.5 w-full rounded-lg border border-[#d8d2c5] bg-white px-3 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]" /></label>
          <button type="button" disabled={pending || !question.trim() || !answer.trim()} onClick={() => startTransition(async () => {
            const result = await createGlobalFaq({ question, answer });
            setMessage(result.message);
            if (result.ok && result.id) {
              setFaqs((current) => [...current, { id: result.id!, question: question.trim(), answer: answer.trim(), is_active: true, display_order: current.length }]);
              setQuestion("");
              setAnswer("");
            }
          })} className="inline-flex min-h-11 w-fit items-center rounded-lg bg-[#123d32] px-4 text-sm font-bold text-white hover:bg-[#1a5445] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c] disabled:opacity-50"><Plus className="mr-2 h-4 w-4" aria-hidden="true" />Add FAQ</button>
        </div>
      </AdminPanel>

      <AdminPanel className="overflow-hidden">
        {faqs.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-[#69756f]">No global FAQs have been added.</p>
        ) : (
          <ul className="divide-y divide-[#e8e3d8]">
            {[...faqs].sort((a, b) => a.display_order - b.display_order).map((faq) => (
              <li key={faq.id} className="grid gap-4 p-5 lg:grid-cols-[1fr_7rem_auto] lg:items-end">
                <div className="grid gap-3">
                  <label className="text-xs font-bold text-[#4c5e57]">Question<input value={faq.question} onChange={(event) => setFaqs((current) => current.map((item) => item.id === faq.id ? { ...item, question: event.target.value } : item))} className={`mt-1 ${fieldClass}`} /></label>
                  <label className="text-xs font-bold text-[#4c5e57]">Answer<textarea value={faq.answer} rows={3} onChange={(event) => setFaqs((current) => current.map((item) => item.id === faq.id ? { ...item, answer: event.target.value } : item))} className="mt-1 w-full rounded-lg border border-[#d8d2c5] bg-white px-3 py-3 text-sm font-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#b58a2c]" /></label>
                  <label className="flex min-h-11 items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={faq.is_active} onChange={(event) => setFaqs((current) => current.map((item) => item.id === faq.id ? { ...item, is_active: event.target.checked } : item))} className="h-5 w-5 accent-[#176342]" />Active on homepage</label>
                </div>
                <label className="text-xs font-bold text-[#4c5e57]">Order<input type="number" min={0} value={faq.display_order} onChange={(event) => setFaqs((current) => current.map((item) => item.id === faq.id ? { ...item, display_order: Math.max(0, Number(event.target.value)) } : item))} className={`mt-1 ${fieldClass}`} /></label>
                <div className="flex gap-2">
                  <button type="button" disabled={pending} onClick={() => startTransition(async () => {
                    const result = await updateGlobalFaq({ id: faq.id, question: faq.question, answer: faq.answer, isActive: faq.is_active, displayOrder: faq.display_order });
                    setMessage(result.message);
                  })} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[#e3f2eb] text-[#176342] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#176342]" aria-label={`Save ${faq.question}`}><Check className="h-4 w-4" aria-hidden="true" /></button>
                  <button type="button" disabled={pending} onClick={() => startTransition(async () => {
                    const result = await deleteGlobalFaq(faq.id);
                    setMessage(result.message);
                    if (result.ok) setFaqs((current) => current.filter((item) => item.id !== faq.id));
                  })} className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg bg-[#fff0ed] text-[#9a3d2e] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9a3d2e]" aria-label={`Delete ${faq.question}`}><Trash2 className="h-4 w-4" aria-hidden="true" /></button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </>
  );
}
