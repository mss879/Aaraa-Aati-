import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Anonymous, session-less Supabase client for PUBLIC server rendering (the shop
 * catalogue). Deliberately not the cookie-bound server client: reading cookies
 * would opt every storefront page into dynamic rendering, and the storefront has
 * no session to read. RLS runs as `anon`, which by policy sees only active
 * categories, active products and their images.
 */
export function createSupabasePublicClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
