import "server-only";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { signGenerationUrl } from "@/lib/admin/storage";
import type {
  AiConversation,
  AiConversationWithMessages,
  AiMessage,
  CraftRequest,
  Generation,
  Inquiry,
  Lead,
  LeadStage,
  Note,
  Order,
  OrderEmail,
  OrderItem,
  OrderWithItems,
  ProductCategory,
  ProductWithImages,
} from "@/lib/supabase/types";

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

/** A craft request plus the signed renders produced while designing it. */
export type CraftRequestWithRenders = CraftRequest & {
  renders: { id: string; status: "done" | "failed"; created_at: string; imageUrl: string | null }[];
};

export async function getCraftRequests(): Promise<CraftRequestWithRenders[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("craft_requests")
    .select("*")
    .order("created_at", { ascending: false });
  const requests = (data as CraftRequest[]) ?? [];
  if (requests.length === 0) return [];

  const { data: gens } = await supabase
    .from("generations")
    .select("id, craft_request_id, image_path, status, created_at")
    .in("craft_request_id", requests.map((r) => r.id))
    .order("created_at", { ascending: false });

  const byRequest: Record<string, CraftRequestWithRenders["renders"]> = {};
  for (const g of (gens as Pick<
    Generation,
    "id" | "craft_request_id" | "image_path" | "status" | "created_at"
  >[]) ?? []) {
    if (!g.craft_request_id) continue;
    (byRequest[g.craft_request_id] ??= []).push({
      id: g.id,
      status: g.status,
      created_at: g.created_at,
      imageUrl: await signGenerationUrl(g.image_path),
    });
  }

  return requests.map((r) => ({ ...r, renders: byRequest[r.id] ?? [] }));
}

/* --------------------------------------------------------------- shop */

/**
 * Every AI conversation with its transcript, newest thread first.
 *
 * Two queries, not one per thread: the inbox shows a dozen conversations and a
 * per-row fetch would be a dozen round trips. Messages come back in one sweep
 * and are bucketed in memory.
 */
export async function getAiConversations(limit = 100): Promise<AiConversationWithMessages[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();

  const { data: conversations } = await supabase
    .from("ai_conversations")
    .select("*")
    .order("last_message_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  const rows = (conversations as AiConversation[]) ?? [];
  if (rows.length === 0) return [];

  const { data: messages } = await supabase
    .from("ai_messages")
    .select("*")
    .in("conversation_id", rows.map((c) => c.id))
    .order("created_at", { ascending: true });

  const byConversation = new Map<string, AiMessage[]>();
  for (const m of ((messages as AiMessage[]) ?? [])) {
    const bucket = byConversation.get(m.conversation_id);
    if (bucket) bucket.push(m);
    else byConversation.set(m.conversation_id, [m]);
  }

  return rows.map((c) => ({ ...c, messages: byConversation.get(c.id) ?? [] }));
}

export async function getProductCategories(): Promise<ProductCategory[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("product_categories")
    .select("*")
    .order("sort_index", { ascending: true })
    .order("name", { ascending: true });
  return (data as ProductCategory[]) ?? [];
}

const ADMIN_PRODUCT_SELECT =
  "*, category:product_categories(id, slug, name), images:product_images(id, created_at, product_id, path, position, alt)";

const sortImages = (p: ProductWithImages): ProductWithImages => ({
  ...p,
  images: [...(p.images ?? [])].sort((a, b) => a.position - b.position),
});

/** Every product, published or not — the back office sees drafts too. */
export async function getAdminProducts(): Promise<ProductWithImages[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .order("sort_index", { ascending: false });
  return ((data as ProductWithImages[]) ?? []).map(sortImages);
}

export async function getAdminProduct(id: string): Promise<ProductWithImages | null> {
  if (!hasSupabaseEnv) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select(ADMIN_PRODUCT_SELECT)
    .eq("id", id)
    .maybeSingle();
  return data ? sortImages(data as ProductWithImages) : null;
}

export async function getOrders(): Promise<OrderWithItems[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("orders")
    .select("*, items:order_items(*), emails:order_emails(*)")
    .order("created_at", { ascending: false });
  const rows =
    (data as (Order & { items: OrderItem[] | null; emails: OrderEmail[] | null })[]) ?? [];
  return rows.map((o) => ({
    ...o,
    items: o.items ?? [],
    // Newest first — the dashboard reads this as a conversation log.
    emails: [...(o.emails ?? [])].sort((a, b) => b.created_at.localeCompare(a.created_at)),
  }));
}

type Person = { name: string; phone: string } | null;

export type GenerationWithMeta = Generation & {
  /** Who made it: the CRM lead if it has been promoted, else the craft request. */
  lead: Person;
  imageUrl: string | null;
};

export async function getRecentGenerations(limit = 8): Promise<GenerationWithMeta[]> {
  if (!hasSupabaseEnv) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("generations")
    .select("*, lead:leads(name, phone), request:craft_requests(name, phone)")
    .order("created_at", { ascending: false })
    .limit(limit);
  const rows = (data as (Generation & { lead: Person; request: Person })[]) ?? [];
  return Promise.all(
    rows.map(async ({ request, ...g }) => ({
      ...g,
      // Renders belong to a craft request until it is promoted, so fall back to
      // the request's own contact rather than showing "Anonymous".
      lead: g.lead ?? request,
      imageUrl: await signGenerationUrl(g.image_path),
    })),
  );
}

export interface DashboardStats {
  configured: boolean;
  stageCounts: Record<LeadStage, number>;
  totalLeads: number;
  newInquiries: number;
  newCraftRequests: number;
  totalGenerations: number;
  wonValue: number;
  liveProducts: number;
  pendingOrders: number;
  orderValue: number;
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
      newCraftRequests: 0,
      totalGenerations: 0,
      wonValue: 0,
      liveProducts: 0,
      pendingOrders: 0,
      orderValue: 0,
    };
  }
  const supabase = await createSupabaseServerClient();
  const [
    { data: leads },
    inqCount,
    craftCount,
    genCount,
    productCount,
    pendingOrderCount,
    { data: orders },
  ] = await Promise.all([
    supabase.from("leads").select("stage, estimated_price").eq("archived", false),
    supabase.from("inquiries").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("craft_requests").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("generations").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending"),
    // Booked value = everything not cancelled; the tile reads "orders taken",
    // not "cash received" (payment is tracked separately per order).
    supabase.from("orders").select("total, status").neq("status", "cancelled"),
  ]);

  const stageCounts = { ...EMPTY_STAGES };
  let wonValue = 0;
  for (const row of (leads as { stage: LeadStage; estimated_price: number | null }[]) ?? []) {
    if (row.stage in stageCounts) stageCounts[row.stage] += 1;
    if (row.stage === "won") wonValue += row.estimated_price ?? 0;
  }

  let orderValue = 0;
  for (const row of (orders as { total: number | null }[]) ?? []) {
    orderValue += Number(row.total ?? 0);
  }

  return {
    configured: true,
    stageCounts,
    totalLeads: (leads?.length as number) ?? 0,
    newInquiries: inqCount.count ?? 0,
    newCraftRequests: craftCount.count ?? 0,
    totalGenerations: genCount.count ?? 0,
    wonValue,
    liveProducts: productCount.count ?? 0,
    pendingOrders: pendingOrderCount.count ?? 0,
    orderValue,
  };
}
