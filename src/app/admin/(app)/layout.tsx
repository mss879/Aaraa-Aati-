import { requireAdmin } from "@/lib/admin/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import AdminShell from "@/app/admin/_components/AdminShell";

// Force dynamic — everything here is per-request, authenticated, and uncacheable.
export const dynamic = "force-dynamic";

export default async function AdminAppLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  let newInquiries = 0;
  if (hasSupabaseEnv) {
    const supabase = await createSupabaseServerClient();
    const { count } = await supabase
      .from("inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new");
    newInquiries = count ?? 0;
  }

  return (
    <AdminShell email={admin.email} newInquiries={newInquiries}>
      {children}
    </AdminShell>
  );
}
