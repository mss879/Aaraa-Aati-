import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/** Allow-listed admin emails from ADMIN_EMAILS (comma-separated). */
export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return getAdminEmails().includes(email.toLowerCase());
}

/**
 * The signed-in admin, or null. Belt-and-suspenders: the user must have a valid
 * Supabase session AND their email must be in the ADMIN_EMAILS allowlist (which
 * mirrors the `admins` table that RLS checks). Returns just the fields we use.
 */
export async function getAdminUser(): Promise<{ id: string; email: string } | null> {
  if (!hasSupabaseEnv) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email || !isAdminEmail(user.email)) return null;
  return { id: user.id, email: user.email };
}

/**
 * Gate a Server Component, Server Action or Route Handler on admin auth.
 * Redirects to the login page when the caller isn't an allow-listed admin.
 */
export async function requireAdmin(): Promise<{ id: string; email: string }> {
  const user = await getAdminUser();
  if (!user) redirect("/admin/login");
  return user;
}
