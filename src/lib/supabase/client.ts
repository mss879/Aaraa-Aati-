"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

/**
 * Browser Supabase client for interactive admin components (Kanban drag, notes,
 * sign-in). Uses the anon key; all access is scoped by RLS to allow-listed
 * admins, so this is safe to ship to the client.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
