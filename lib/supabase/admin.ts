import "server-only";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Creates a privileged database client. Callers must validate the Maqbool
 * admin cookie with requireAdmin() before invoking this function.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secret) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  /*
   * New Supabase `sb_secret_...` keys are opaque API keys, not JWTs.
   * Older supabase-js releases also copy the supplied key into Authorization,
   * which makes the gateway try to validate it as a JWT ("JWT issued at future").
   * Keep the secret in `apikey` and remove only that erroneous bearer value.
   * A genuine user access token, if one is ever supplied, is left untouched.
   */
  const secretKeyFetch: typeof fetch = (input, init) => {
    const headers = new Headers(init?.headers);
    headers.set("apikey", secret);
    if (
      secret.startsWith("sb_secret_")
      && headers.get("authorization") === `Bearer ${secret}`
    ) {
      headers.delete("authorization");
    }
    return fetch(input, { ...init, headers, cache: "no-store" });
  };

  return createClient<Database>(url, secret, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      fetch: secretKeyFetch,
    },
  });
}
