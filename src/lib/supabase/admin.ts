import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL } from "./env";

/**
 * Service-role Supabase client — bypasses RLS. Server-only (guarded by the
 * "server-only" import above, which throws if this module is ever pulled into a
 * client bundle). Used by public API routes for validated + rate-limited writes,
 * for Storage uploads, and for privileged reads. NEVER import from a Client
 * Component.
 */
export function createSupabaseAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
