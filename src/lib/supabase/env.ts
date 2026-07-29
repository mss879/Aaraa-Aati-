/**
 * Central place to read (and validate the presence of) Supabase environment.
 * Everything is optional so the site builds and the public pages render even
 * before Supabase is wired up — server routes check these flags and return a
 * friendly 503 when the backend isn't configured yet.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

/** True when the public (browser-safe) Supabase config is present. */
export const hasSupabaseEnv = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** True when the server-only service-role key is also present. */
export const hasServiceRole = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

/** Bucket that holds AI-generated ring renders (private). */
export const GENERATIONS_BUCKET = "ring-generations";
