"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type FaqItem = { question: string; answer: string };

export function Faq({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="mx-auto max-w-[800px] space-y-3">
      {items.map((item, index) => {
        const active = open === index;
        return (
          <div key={item.question} className="overflow-hidden rounded-md border border-[#e3dec8] bg-white">
            <button
              type="button"
              aria-expanded={active}
              onClick={() => setOpen(active ? null : index)}
              className="flex w-full items-center justify-between px-5 py-[18px] text-left text-[0.95rem] font-semibold text-forest"
            >
              {item.question}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${active ? "rotate-180" : ""}`}
              />
            </button>
            {active && <p className="px-5 pb-[18px] text-sm leading-6 text-muted">{item.answer}</p>}
          </div>
        );
      })}
    </div>
  );
}
