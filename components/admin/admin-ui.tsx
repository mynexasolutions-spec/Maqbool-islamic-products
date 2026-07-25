import { cn } from "@/lib/utils";

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        <p className="mb-1 text-[11px] font-bold uppercase tracking-[.2em] text-[#a47a22]">{eyebrow}</p>
        <h1 className="font-heading text-3xl text-[#123d32] sm:text-4xl">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#64716c]">{description}</p>
      </div>
      {action}
    </div>
  );
}

export function AdminPanel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("rounded-2xl border border-[#ded9cc] bg-white shadow-[0_12px_36px_rgba(25,55,45,.05)]", className)}>{children}</section>;
}

export function StatusPill({ active, label }: { active: boolean; label?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
      active ? "bg-[#e3f2eb] text-[#176342]" : "bg-[#eeeae1] text-[#6f6656]",
    )}>
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-[#209461]" : "bg-[#9d927f]")} aria-hidden="true" />
      {label ?? (active ? "Active" : "Inactive")}
    </span>
  );
}

export function EmptyAdminState({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-6 py-16 text-center">
      <div className="mx-auto mb-4 h-12 w-12 rounded-full border-8 border-[#f0ece2] bg-[#d5b56d]" aria-hidden="true" />
      <h2 className="font-heading text-xl text-[#123d32]">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-[#69756f]">{description}</p>
    </div>
  );
}
