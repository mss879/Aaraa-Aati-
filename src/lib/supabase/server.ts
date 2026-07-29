import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Cookie-bound Supabase client for Server Components, Server Actions and Route
 * Handlers. Reads/writes the auth session via the request cookies, so RLS runs
 * as the signed-in admin. Next 16: cookies() is async.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component where cookies are read-only. Safe to
          // ignore — the proxy (src/proxy.ts) refreshes the session cookie.
        }
      },
    },
  });
}
