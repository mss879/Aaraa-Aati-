import type { RingConfig } from "@/lib/ring-options";

/** Row shapes mirroring supabase/migrations. Hand-written (small surface). */

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "quoted"
  | "won"
  | "lost";

export type LeadSource = "atelier" | "inquiry" | "manual";

export interface Lead {
  id: string;
  created_at: string;
  updated_at: string;
  name: string;
  phone: string;
  email: string | null;
  source: LeadSource;
  stage: LeadStage;
  sort_index: number;
  config: RingConfig | null;
  estimated_price: number | null;
  note: string | null;
  inquiry_id: string | null;
  archived: boolean;
}

export type InquiryStatus = "new" | "read" | "archived";

export interface Inquiry {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  interest: string | null;
  message: string;
  source_piece: string | null;
  status: InquiryStatus;
  promoted_lead_id: string | null;
}

export type NoteColor = "sapphire" | "amber" | "emerald" | "rose" | "slate";

export interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  body: string;
  color: NoteColor;
  pinned: boolean;
  author: string | null;
}

export interface Generation {
  id: string;
  created_at: string;
  lead_id: string | null;
  config: RingConfig;
  estimated_price: number | null;
  prompt: string | null;
  image_path: string | null;
  image_mime: string | null;
  status: "done" | "failed";
  ip_hash: string | null;
  user_agent: string | null;
}
