import { cn } from "@/lib/utils";

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("h-10 rounded-md border bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-gold", className)} {...props} />;
}

