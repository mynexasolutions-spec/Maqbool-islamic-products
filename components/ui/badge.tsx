import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-forest", className)} {...props} />;
}

