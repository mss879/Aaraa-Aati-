"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAdminUser, requireAdmin } from "@/lib/admin/auth";
import type { LeadStage, NoteColor } from "@/lib/supabase/types";

/**
 * Server actions for the admin dashboard. Every mutation re-verifies the admin
 * and runs through the cookie-bound session client, so RLS is enforced as the
 * signed-in admin (belt-and-suspenders on top of requireAdmin()).
 */

const STAGES: LeadStage[] = ["new", "contacted", "qualified", "quoted", "won", "lost"];
const COLORS: NoteColor[] = ["sapphire", "amber", "emerald", "rose", "slate"];

// ---------------------------------------------------------------- CRM leads

export async function moveLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const stage = String(formData.get("stage") ?? "") as LeadStage;
  const sortIndex = Number(formData.get("sortIndex") ?? 0);
  if (!id || !STAGES.includes(stage)) return;

  const supabase = await createSupabaseServerClient();
  await supabase
    .from("leads")
    .update({ stage, sort_index: Number.isFinite(sortIndex) ? sortIndex : 0 })
    .eq("id", id);
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

export async function updateLeadNote(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const note = String(formData.get("note") ?? "").slice(0, 4000);
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("leads").update({ note }).eq("id", id);
  revalidatePath("/admin/crm");
}

export async function archiveLead(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("leads").update({ archived: true }).eq("id", id);
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

// ------------------------------------------------------------- inquiries

export async function setInquiryStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !["new", "read", "archived"].includes(status)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("inquiries").update({ status }).eq("id", id);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}

/** Promote an inquiry into a CRM lead (source='inquiry') and link both ways. */
export async function promoteInquiry(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createSupabaseServerClient();
  const { data: inq } = await supabase
    .from("inquiries")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!inq) return;
  if (inq.promoted_lead_id) {
    // already promoted — no-op
    revalidatePath("/admin/inquiries");
    return;
  }

  const { data: lead } = await supabase
    .from("leads")
    .insert({
      name: inq.name,
      phone: inq.phone ?? "—",
      email: inq.email,
      source: "inquiry",
      stage: "new",
      note: inq.interest ? `${inq.interest}\n\n${inq.message}` : inq.message,
      inquiry_id: inq.id,
    })
    .select("id")
    .single();

  if (lead) {
    await supabase
      .from("inquiries")
      .update({ promoted_lead_id: lead.id, status: "read" })
      .eq("id", inq.id);
  }
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin/crm");
  revalidatePath("/admin");
}

// ------------------------------------------------------------------ notes

export async function createNote(formData: FormData) {
  const admin = await requireAdmin();
  const body = String(formData.get("body") ?? "").slice(0, 4000);
  const color = String(formData.get("color") ?? "sapphire") as NoteColor;
  if (!body.trim()) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("notes").insert({
    body,
    color: COLORS.includes(color) ? color : "sapphire",
    author: admin.email,
  });
  revalidatePath("/admin/notes");
  revalidatePath("/admin");
}

export async function updateNote(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const body = String(formData.get("body") ?? "").slice(0, 4000);
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  const patch: { body?: string; pinned?: boolean; color?: NoteColor } = {};
  if (formData.has("body")) patch.body = body;
  if (formData.has("pinned")) patch.pinned = formData.get("pinned") === "true";
  const color = formData.get("color");
  if (typeof color === "string" && COLORS.includes(color as NoteColor)) {
    patch.color = color as NoteColor;
  }
  await supabase.from("notes").update(patch).eq("id", id);
  revalidatePath("/admin/notes");
  revalidatePath("/admin");
}

export async function deleteNote(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("notes").delete().eq("id", id);
  revalidatePath("/admin/notes");
  revalidatePath("/admin");
}

// ------------------------------------------------------------------- auth

export async function signOut() {
  // Only a real admin session can sign out; harmless otherwise.
  if (await getAdminUser()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
