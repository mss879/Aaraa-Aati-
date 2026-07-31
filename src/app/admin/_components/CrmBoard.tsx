"use client";

import { useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  LEAD_STAGES,
  SOURCE_META,
  configSummary,
  formatDate,
  formatPrice,
} from "@/lib/leads";
import type { Lead, LeadStage } from "@/lib/supabase/types";

export type LeadGeneration = {
  id: string;
  status: "done" | "failed";
  created_at: string;
  imageUrl: string | null;
};

export default function CrmBoard({
  initialLeads,
  generationsByLead,
}: {
  initialLeads: Lead[];
  generationsByLead: Record<string, LeadGeneration[]>;
}) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<LeadStage | null>(null);
  const supabaseRef = useRef(createSupabaseBrowserClient());
  const supabase = supabaseRef.current;

  const byStage = useMemo(() => {
    const map: Record<LeadStage, Lead[]> = {
      new: [], contacted: [], qualified: [], quoted: [], won: [], lost: [],
    };
    for (const l of leads) map[l.stage]?.push(l);
    for (const s of Object.keys(map) as LeadStage[]) {
      map[s].sort((a, b) => b.sort_index - a.sort_index);
    }
    return map;
  }, [leads]);

  const selected = leads.find((l) => l.id === selectedId) ?? null;

  const persist = async (id: string, patch: Partial<Lead>) => {
    setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
    await supabase.from("leads").update(patch).eq("id", id);
  };

  const drop = async (stage: LeadStage) => {
    setOverStage(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    const topIndex = Math.max(0, ...byStage[stage].map((l) => l.sort_index)) + 1;
    await persist(id, { stage, sort_index: topIndex });
  };

  const archive = async (id: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    setSelectedId(null);
    await supabase.from("leads").update({ archived: true }).eq("id", id);
  };

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STAGES.map((stage) => {
          const items = byStage[stage.id];
          const isOver = overStage === stage.id;
          return (
            <div
              key={stage.id}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage.id); }}
              onDragLeave={() => setOverStage((s) => (s === stage.id ? null : s))}
              onDrop={() => drop(stage.id)}
              /* In daylight the column is the tray and the cards are the paper
                 on it: a tinted panel with white cards lifted off it. */
              className={`flex w-72 shrink-0 flex-col rounded-2xl border transition-colors ${
                isOver
                  ? "border-[var(--adm-accent)] bg-[var(--adm-accent-tint)]"
                  : "border-[var(--adm-line)] bg-[var(--adm-inset)]"
              }`}
            >
              <div className="flex items-center justify-between border-b border-[var(--adm-line)] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.accent }} />
                  <span className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-[var(--adm-ink)]">
                    {stage.label}
                  </span>
                </div>
                <span className="font-serif text-sm text-[var(--adm-muted)]">{items.length}</span>
              </div>

              <div className="flex min-h-[120px] flex-col gap-2.5 p-3">
                {items.length === 0 && (
                  <p className="py-6 text-center font-body text-[0.7rem] text-[var(--adm-faint)]">Drop here</p>
                )}
                {items.map((lead) => {
                  const src = SOURCE_META[lead.source];
                  const thumb = generationsByLead[lead.id]?.find((g) => g.imageUrl)?.imageUrl ?? null;
                  return (
                    <button
                      key={lead.id}
                      type="button"
                      draggable
                      onDragStart={() => setDragId(lead.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => setSelectedId(lead.id)}
                      className={`group w-full rounded-xl border border-[var(--adm-line)] bg-white p-3 text-left shadow-[0_1px_2px_rgba(19,41,75,0.05)] transition-all hover:-translate-y-px hover:border-[var(--adm-accent)] hover:shadow-[var(--adm-shadow)] cursor-grab active:cursor-grabbing ${
                        dragId === lead.id ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {thumb && (
                          // eslint-disable-next-line @next/next/no-img-element -- signed private URL
                          <img src={thumb} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-white object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-body text-sm text-[var(--adm-ink)]">{lead.name}</p>
                          <p className="truncate font-body text-[0.7rem] text-[var(--adm-ink-soft)]">{lead.phone}</p>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 font-body text-[0.68rem] leading-snug text-[var(--adm-muted)]">
                        {configSummary(lead.config)}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span
                          className="rounded-full px-2 py-0.5 font-sans text-[0.55rem] uppercase tracking-[0.14em]"
                          style={{ backgroundColor: `${src.accent}22`, color: src.accent }}
                        >
                          {src.label}
                        </span>
                        <span className="font-serif text-[0.78rem] text-[var(--adm-accent-strong)]">
                          {formatPrice(lead.estimated_price)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail drawer */}
      {selected && (
        <LeadDrawer
          lead={selected}
          generations={generationsByLead[selected.id] ?? []}
          onClose={() => setSelectedId(null)}
          onStage={(stage) => persist(selected.id, { stage })}
          onNote={(note) => persist(selected.id, { note })}
          onArchive={() => archive(selected.id)}
        />
      )}
    </>
  );
}

function LeadDrawer({
  lead,
  generations,
  onClose,
  onStage,
  onNote,
  onArchive,
}: {
  lead: Lead;
  generations: LeadGeneration[];
  onClose: () => void;
  onStage: (stage: LeadStage) => void;
  onNote: (note: string) => void;
  onArchive: () => void;
}) {
  const [note, setNote] = useState(lead.note ?? "");
  const src = SOURCE_META[lead.source];

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-[#13294b]/25 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--adm-line)] bg-white p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <span
              className="rounded-full px-2 py-0.5 font-sans text-[0.55rem] uppercase tracking-[0.14em]"
              style={{ backgroundColor: `${src.accent}22`, color: src.accent }}
            >
              {src.label} · {formatDate(lead.created_at)}
            </span>
            <h2 className="mt-3 font-serif text-2xl font-light text-[var(--adm-ink)]">{lead.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--adm-line)] text-[var(--adm-muted)] transition-colors hover:border-[var(--adm-accent)] hover:text-[var(--adm-accent)] cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Contact */}
        <div className="mt-5 space-y-2 adm-inset p-4">
          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 font-body text-sm text-[var(--adm-ink)] hover:text-[var(--adm-accent)]">
            <span className="text-[var(--adm-muted)]">Phone</span> {lead.phone}
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 font-body text-sm text-[var(--adm-ink)] hover:text-[var(--adm-accent)]">
              <span className="text-[var(--adm-muted)]">Email</span> {lead.email}
            </a>
          )}
        </div>

        {/* Stage */}
        <div className="mt-5">
          <p className="mb-2 adm-label">Stage</p>
          <div className="flex flex-wrap gap-1.5">
            {LEAD_STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onStage(s.id)}
                className={`rounded-full px-3 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                  lead.stage === s.id ? "text-white" : "text-[var(--adm-ink-soft)] hover:text-[var(--adm-ink)]"
                }`}
                style={lead.stage === s.id ? { backgroundColor: s.accent } : { backgroundColor: "var(--adm-inset)" }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Design */}
        <div className="mt-5 adm-inset p-4">
          <p className="adm-label">Design</p>
          <p className="mt-1.5 font-body text-sm text-[var(--adm-ink)]">{configSummary(lead.config)}</p>
          <p className="mt-2 font-serif text-lg text-[var(--adm-accent-strong)]">{formatPrice(lead.estimated_price)}</p>
        </div>

        {/* Generations */}
        {generations.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 adm-label">
              AI renders ({generations.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {generations.map((g) =>
                g.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed private URL
                  <img key={g.id} src={g.imageUrl} alt="" className="aspect-square w-full rounded-lg bg-white object-cover" />
                ) : (
                  <div key={g.id} className="flex aspect-square items-center justify-center rounded-lg border border-[var(--adm-line)] font-sans text-[0.55rem] uppercase tracking-[0.15em] text-[var(--adm-faint)]">
                    {g.status}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mt-5">
          <p className="mb-2 adm-label">Note</p>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== (lead.note ?? "") && onNote(note)}
            placeholder="Add context, next steps, quoted price…"
            className="adm-field resize-none"
          />
        </div>

        <button
          type="button"
          onClick={onArchive}
          className="mt-6 adm-danger-link"
        >
          Archive lead
        </button>
      </div>
    </div>
  );
}
