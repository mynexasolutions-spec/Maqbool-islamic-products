import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, ADMIN_SESSION_HOURS, createAdminSession } from "@/lib/admin-auth";

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export async function POST(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const now = Date.now();
  const record = attempts.get(identifier);
  if (record && record.resetAt > now && record.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Unable to sign in. Please try again later." }, { status: 429 });
  }

  let body: { adminId?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid credentials." }, { status: 400 });
  }

  const configuredId = process.env.ADMIN_ID;
  const configuredPassword = process.env.ADMIN_PASSWORD;
  const valid = Boolean(
    configuredId &&
    configuredPassword &&
    body.adminId === configuredId &&
    body.password === configuredPassword,
  );
  if (!valid) {
    const current = record && record.resetAt > now ? record : { count: 0, resetAt: now + WINDOW_MS };
    attempts.set(identifier, { ...current, count: current.count + 1 });
    return NextResponse.json({ error: "Invalid credentials." }, { status: 401 });
  }

  attempts.delete(identifier);
  const token = await createAdminSession(configuredId!);
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_HOURS * 60 * 60,
  });
  return response;
}

