import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/admin-shell";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders = await headers();
  if (requestHeaders.get("x-maqbool-admin-login") !== "1") {
    const cookieStore = await cookies();
    const session = await verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
    if (!session) redirect("/admin/login");
  }
  return <AdminShell>{children}</AdminShell>;
}
