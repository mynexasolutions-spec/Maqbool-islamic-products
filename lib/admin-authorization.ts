import "server-only";

import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";

export class AdminAuthorizationError extends Error {
  readonly status = 401;

  constructor() {
    super("Administrator authentication is required.");
    this.name = "AdminAuthorizationError";
  }
}

export async function requireAdmin() {
  const cookieStore = await cookies();
  const session = await verifyAdminSession(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!session) throw new AdminAuthorizationError();
  return session;
}
