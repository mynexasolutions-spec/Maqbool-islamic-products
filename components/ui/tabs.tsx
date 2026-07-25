"use client";

import { cn } from "@/lib/utils";

export function Tabs<T extends string>({ tabs, value, onChange, children }: {
  tabs: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex gap-1 overflow-x-auto border-b" role="tablist">
        {tabs.map((tab) => <button key={tab.value} role="tab" aria-selected={value === tab.value} onClick={() => onChange(tab.value)} className={cn("min-w-fit border-b-2 px-4 py-3 text-sm font-semibold", value === tab.value ? "border-gold text-forest" : "border-transparent text-muted")}>{tab.label}</button>)}
      </div>
      <div className="py-5">{children}</div>
    </div>
  );
}

