import { type NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, verifyAdminSession } from "@/lib/admin-auth";
import { DEFAULT_MARKET, isMarketSlug, MARKET_COOKIE } from "@/lib/markets";

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
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

  if (pathname.startsWith("/api")) return NextResponse.next();

  const segments = pathname.split("/");
  const prefix = segments[1];
  if (isMarketSlug(prefix)) {
    const destination = request.nextUrl.clone();
    destination.pathname = `/${segments.slice(2).join("/")}`.replace(/\/$/, "") || "/";
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-maqbool-market", prefix);
    const response = NextResponse.rewrite(destination, { request: { headers: requestHeaders } });
    response.cookies.set(MARKET_COOKIE, prefix, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
    return response;
  }

  const cookieMarket = request.cookies.get(MARKET_COOKIE)?.value;
  const market = isMarketSlug(cookieMarket) ? cookieMarket : DEFAULT_MARKET;
  const destination = request.nextUrl.clone();
  destination.pathname = pathname === "/" ? `/${market}` : `/${market}${pathname}`;
  return NextResponse.redirect(destination);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
