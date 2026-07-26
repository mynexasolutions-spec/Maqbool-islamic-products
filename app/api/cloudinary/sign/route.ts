import { NextResponse } from "next/server";
import { AdminAuthorizationError, requireAdmin } from "@/lib/admin-authorization";
import {
  isCloudinaryScope,
} from "@/lib/cloudinary/scopes";
import { signCloudinaryParameters } from "@/lib/cloudinary/server";
import { normalizeSigningParams, validateSigningParams } from "@/lib/cloudinary/signing-policy";

type SignBody = { paramsToSign?: unknown };

export async function POST(request: Request) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthorizationError) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Unable to verify the admin session." }, { status: 500 });
  }

  const scopeValue = new URL(request.url).searchParams.get("scope") ?? "";
  if (!isCloudinaryScope(scopeValue)) {
    return NextResponse.json({ error: "Unknown media scope." }, { status: 400 });
  }

  let body: SignBody;
  try {
    body = await request.json() as SignBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const params = normalizeSigningParams(body.paramsToSign);
  if (!params) {
    return NextResponse.json({ error: "Invalid signing parameters." }, { status: 400 });
  }

  const policyError = validateSigningParams(scopeValue, params);
  if (policyError) return NextResponse.json({ error: policyError }, { status: 400 });

  try {
    return NextResponse.json({ signature: signCloudinaryParameters(params) });
  } catch {
    return NextResponse.json({ error: "Cloudinary signing is unavailable." }, { status: 503 });
  }
}
