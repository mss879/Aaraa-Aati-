import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import AdminShell, { type NavBadges } from "@/app/admin/_components/AdminShell";

// Force dynamic — everything here is per-request, authenticated, and uncacheable.
export const dynamic = "force-dynamic";

const NO_BADGES: NavBadges = { inquiries: 0, crafting: 0, orders: 0 };

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  // The three counters on the rail: untriaged contact messages, untriaged
  // commissions, and orders still awaiting confirmation.
  let badges = NO_BADGES;
  if (hasSupabaseEnv) {
    const supabase = await createSupabaseServerClient();
    const [inquiries, crafting, orders] = await Promise.all([
      supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("craft_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    ]);
    badges = {
      inquiries: inquiries.count ?? 0,
      crafting: crafting.count ?? 0,
      orders: orders.count ?? 0,
    };
  }

  return (
    <AdminShell email={admin.email} badges={badges}>
      {children}
    </AdminShell>
  );
}
