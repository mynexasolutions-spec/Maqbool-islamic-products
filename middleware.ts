import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-maqbool-admin-login", "1");
    return NextResponse.next({ request: { headers: requestHeaders } });
  }
  const session = await verifyAdminSession(request.cookies.get(ADMIN_COOKIE)?.value);
  if (session) return NextResponse.next();
  const login = new URL("/admin/login", request.url);
  login.searchParams.set("returnTo", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ["/admin/:path*"],
};
