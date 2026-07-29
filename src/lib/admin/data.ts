import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { signGenerationUrl } from "@/lib/admin/storage";
import type { Generation, Inquiry, Lead, LeadStage, Note } from "@/lib/supabase/types";

/** All queries degrade to empty results when Supabase isn't configured yet. */

export async function getNotes(): Promise<Note[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("notes")
    .select("*")
    .order("pinned", { ascending: false })
    .order("updated_at", { ascending: false });
  return (data as Note[]) ?? [];
}

export async function getActiveLeads(): Promise<Lead[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("leads")
    .select("*")
    .eq("archived", false)
    .order("sort_index", { ascending: false });
  return (data as Lead[]) ?? [];
}

export async function getInquiries(): Promise<Inquiry[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Inquiry[]) ?? [];
}

export type GenerationWithMeta = Generation & {
  lead: { name: string; phone: string } | null;
  imageUrl: string | null;
};

export async function getRecentGenerations(limit = 8): Promise<GenerationWithMeta[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("generations")
    .select("*, lead:leads(name, phone)")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (data as (Generation & { lead: { name: string; phone: string } | null })[]) ?? [];
  return Promise.all(
    rows.map(async (g) => ({ ...g, imageUrl: await signGenerationUrl(g.image_path) })),
  );
}

export interface DashboardStats {
  configured: boolean;
  stageCounts: Record<LeadStage, number>;
  totalLeads: number;
  newInquiries: number;
  totalGenerations: number;
  wonValue: number;
}

const EMPTY_STAGES: Record<LeadStage, number> = {
  new: 0,
  contacted: 0,
  qualified: 0,
  quoted: 0,
  won: 0,
  lost: 0,
};

export async function getDashboardStats(): Promise<DashboardStats> {
  if (!hasSupabaseEnv) {
    return {
      configured: false,
      stageCounts: { ...EMPTY_STAGES },
      totalLeads: 0,
      newInquiries: 0,
      totalGenerations: 0,
      wonValue: 0,
    };
  }
  const supabase = await createSupabaseServerClient();
  const [{ data: leads }, inqCount, genCount] = await Promise.all([
    supabase.from("leads").select("stage, estimated_price").eq("archived", false),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("generations").select("id", { count: "exact", head: true }),
  ]);

  const stageCounts = { ...EMPTY_STAGES };
  let wonValue = 0;
  for (const row of (leads as { stage: LeadStage; estimated_price: number | null }[]) ?? []) {
    if (row.stage in stageCounts) stageCounts[row.stage] += 1;
    if (row.stage === "won") wonValue += row.estimated_price ?? 0;
  }

  return {
    configured: true,
    stageCounts,
    totalLeads: (leads?.length as number) ?? 0,
    newInquiries: inqCount.count ?? 0,
    totalGenerations: genCount.count ?? 0,
    wonValue,
  };
}
