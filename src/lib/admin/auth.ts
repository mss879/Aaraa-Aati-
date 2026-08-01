import "server-only";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type AdminUser = { id: string; email: string };

/**
 * Why the gate turned someone away. Carried to the login page as `?reason=` so a
 * misconfigured deploy explains itself instead of bouncing in silence — the
 * three failures below are indistinguishable from the outside otherwise.
 */
export type AdminDenial = "unconfigured" | "signed-out" | "forbidden";

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
 * Belt-and-suspenders: the user must have a valid Supabase session AND their
 * email must be in the ADMIN_EMAILS allowlist (which mirrors the `admins` table
 * that RLS checks). Returns the admin, or the reason they were refused.
 */
async function resolveAdmin(): Promise<{ user: AdminUser } | { denial: AdminDenial }> {
  if (!hasSupabaseEnv) return { denial: "unconfigured" };

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return { denial: "signed-out" };

  if (!isAdminEmail(user.email)) {
    // A real session, refused by the allowlist. On a hosted deploy this is
    // nearly always ADMIN_EMAILS missing from the *runtime* environment (it is
    // server-only, so unlike the NEXT_PUBLIC_* keys nothing else complains) —
    // hence the count in the log: `0 address(es)` means the variable is unset.
    console.warn(
      `[admin] ${user.email} signed in but is not allow-listed — ADMIN_EMAILS holds ${
        getAdminEmails().length
      } address(es)`,
    );
    return { denial: "forbidden" };
  }

  return { user: { id: user.id, email: user.email } };
}

/** The signed-in admin, or null. Returns just the fields we use. */
export async function getAdminUser(): Promise<AdminUser | null> {
  const result = await resolveAdmin();
  return "user" in result ? result.user : null;
}

/**
 * Gate a Server Component, Server Action or Route Handler on admin auth.
 * Redirects to the login page — with the reason — when the caller isn't an
 * allow-listed admin.
 */
export async function requireAdmin(): Promise<AdminUser> {
  const result = await resolveAdmin();
  if ("user" in result) return result.user;
  redirect(`/admin/login?reason=${result.denial}`);
}
