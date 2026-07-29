import { getActiveLeads } from "@/lib/admin/data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { signGenerationUrl } from "@/lib/admin/storage";
import type { Generation } from "@/lib/supabase/types";
import CrmBoard, { type LeadGeneration } from "@/app/admin/_components/CrmBoard";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const leads = await getActiveLeads();

  // Signed generation thumbnails for the leads on the board (latest first).
  const generationsByLead: Record<string, LeadGeneration[]> = {};
  if (hasSupabaseEnv && leads.length) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("generations")
      .select("id, lead_id, image_path, status, created_at")
      .in("lead_id", leads.map((l) => l.id))
      .order("created_at", { ascending: false });
    const rows = (data as Pick<Generation, "id" | "lead_id" | "image_path" | "status" | "created_at">[]) ?? [];
    for (const g of rows) {
      if (!g.lead_id) continue;
      (generationsByLead[g.lead_id] ??= []).push({
        id: g.id,
        status: g.status,
        created_at: g.created_at,
        imageUrl: await signGenerationUrl(g.image_path),
      });
    }
  }

  return (
    <div className="mx-auto max-w-[1400px]">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-gold-50">CRM Pipeline</h1>
        <p className="mt-1.5 font-body text-sm text-[#8595ad]">
          Drag leads across the pipeline. Atelier visitors land in New automatically.
        </p>
      </header>
      {!hasSupabaseEnv && <ConfigNotice />}
      <CrmBoard initialLeads={leads} generationsByLead={generationsByLead} />
    </div>
  );
}
