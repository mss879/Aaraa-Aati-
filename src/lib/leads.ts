import {
  braceletStyleById,
  cutById,
  fitById,
  gemById,
  metalById,
  pendantStyleById,
  pieceById,
  settingById,
  type RingConfig,
} from "@/lib/ring-options";
import type { LeadSource, LeadStage } from "@/lib/supabase/types";

/** CRM pipeline, in order. `accent` is a Tailwind hue used for the column head. */
export const LEAD_STAGES: {
  id: LeadStage;
  label: string;
  accent: string;
}[] = [
  { id: "new", label: "New", accent: "#4f7bee" },
  { id: "contacted", label: "Contacted", accent: "#8fb0f8" },
  { id: "qualified", label: "Qualified", accent: "#a78bfa" },
  { id: "quoted", label: "Quoted", accent: "#f0b429" },
  { id: "won", label: "Won", accent: "#34d399" },
  { id: "lost", label: "Lost", accent: "#8595ad" },
];

export const STAGE_LABEL: Record<LeadStage, string> = Object.fromEntries(
  LEAD_STAGES.map((s) => [s.id, s.label]),
) as Record<LeadStage, string>;

export const SOURCE_META: Record<LeadSource, { label: string; accent: string }> = {
  // 'atelier' is historical: bespoke commissions now arrive promoted from the
  // Crafting inbox, which stamps them 'craft'.
  atelier: { label: "Atelier", accent: "#4f7bee" },
  craft: { label: "Crafting", accent: "#4f7bee" },
  inquiry: { label: "Inquiry", accent: "#f0b429" },
  manual: { label: "Manual", accent: "#8595ad" },
  // The concierge opens these herself, mid-conversation — they arrive in the
  // pipeline without a human triaging them first, so they get their own colour.
  ai: { label: "Concierge", accent: "#12b981" },
};

/**
 * One-line human summary of a saved RingConfig for CRM cards and lead detail.
 * Mirrors the review-screen copy in the atelier. Defensive: config may be a
 * partial/legacy JSON blob, so fall back to "—" rather than throwing.
 */
export function configSummary(config: RingConfig | null | undefined): string {
  if (!config || typeof config !== "object" || !config.piece) return "—";
  try {
    const piece = pieceById(config.piece).label.replace(/^The /, "");
    const metal = metalById(config.metal).label;
    if (config.piece === "bracelet") {
      const style = braceletStyleById(config.braceletStyle);
      const fit = fitById(config.fit);
      const stones = `${style.stoneCount} × ${Number(config.carat).toFixed(2)} ct ${gemById(config.gem).label}`;
      return `${style.label.replace(/ Bracelet$/, "")} Bracelet · ${stones} · ${metal} · ${fit.label} (${fit.size})`;
    }
    const gem = gemById(config.gem).label;
    const cut = cutById(config.cut).label;
    const carat = Number(config.carat).toFixed(1);
    if (config.piece === "necklace") {
      return `${carat} ct ${cut} ${gem} · ${metal} · ${pendantStyleById(config.pendantStyle).label} Pendant`;
    }
    const setting = settingById(config.setting).label;
    return `${carat} ct ${cut} ${gem} · ${metal} · ${setting} ${piece}`;
  } catch {
    return "—";
  }
}

export const formatPrice = (n: number | null | undefined): string =>
  n == null ? "—" : "$" + Math.round(n).toLocaleString("en-US");

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
