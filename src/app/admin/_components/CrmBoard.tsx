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
              className={`flex w-72 shrink-0 flex-col rounded-2xl border bg-[#0a1526] transition-colors ${
                isOver ? "border-gold-400/60 bg-[#0c1a30]" : "border-[#16263f]"
              }`}
            >
              <div className="flex items-center justify-between border-b border-[#16263f] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.accent }} />
                  <span className="font-sans text-[0.68rem] uppercase tracking-[0.18em] text-gold-100">
                    {stage.label}
                  </span>
                </div>
                <span className="font-serif text-sm text-[#6f8199]">{items.length}</span>
              </div>

              <div className="flex min-h-[120px] flex-col gap-2.5 p-3">
                {items.length === 0 && (
                  <p className="py-6 text-center font-body text-[0.7rem] text-[#43536e]">Drop here</p>
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
                      className={`group w-full rounded-xl border border-[#1c2c46] bg-[#0c1930] p-3 text-left transition-all hover:border-gold-400/40 cursor-grab active:cursor-grabbing ${
                        dragId === lead.id ? "opacity-40" : ""
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {thumb && (
                          // eslint-disable-next-line @next/next/no-img-element -- signed private URL
                          <img src={thumb} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-white object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-body text-sm text-gold-50">{lead.name}</p>
                          <p className="truncate font-body text-[0.7rem] text-[#8595ad]">{lead.phone}</p>
                        </div>
                      </div>
                      <p className="mt-2 line-clamp-2 font-body text-[0.68rem] leading-snug text-[#6f8199]">
                        {configSummary(lead.config)}
                      </p>
                      <div className="mt-2.5 flex items-center justify-between">
                        <span
                          className="rounded-full px-2 py-0.5 font-sans text-[0.55rem] uppercase tracking-[0.14em]"
                          style={{ backgroundColor: `${src.accent}22`, color: src.accent }}
                        >
                          {src.label}
                        </span>
                        <span className="font-serif text-[0.78rem] text-gold-200">
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
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-[#16263f] bg-[#0a1526] p-6"
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
            <h2 className="mt-3 font-serif text-2xl font-light text-gold-50">{lead.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#27497A] text-[#A9B8D0] transition-colors hover:border-gold-400/50 hover:text-gold-200 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Contact */}
        <div className="mt-5 space-y-2 rounded-xl border border-[#16263f] bg-[#0c1930] p-4">
          <a href={`tel:${lead.phone}`} className="flex items-center gap-2 font-body text-sm text-gold-100 hover:text-gold-300">
            <span className="text-[#6f8199]">Phone</span> {lead.phone}
          </a>
          {lead.email && (
            <a href={`mailto:${lead.email}`} className="flex items-center gap-2 font-body text-sm text-gold-100 hover:text-gold-300">
              <span className="text-[#6f8199]">Email</span> {lead.email}
            </a>
          )}
        </div>

        {/* Stage */}
        <div className="mt-5">
          <p className="mb-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[#6f8199]">Stage</p>
          <div className="flex flex-wrap gap-1.5">
            {LEAD_STAGES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => onStage(s.id)}
                className={`rounded-full px-3 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.12em] transition-colors cursor-pointer ${
                  lead.stage === s.id ? "text-white" : "text-[#8595ad] hover:text-gold-100"
                }`}
                style={lead.stage === s.id ? { backgroundColor: s.accent } : { backgroundColor: "rgba(255,255,255,0.04)" }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Design */}
        <div className="mt-5 rounded-xl border border-[#16263f] bg-[#0c1930] p-4">
          <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[#6f8199]">Design</p>
          <p className="mt-1.5 font-body text-sm text-gold-100">{configSummary(lead.config)}</p>
          <p className="mt-2 font-serif text-lg text-gold-200">{formatPrice(lead.estimated_price)}</p>
        </div>

        {/* Generations */}
        {generations.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[#6f8199]">
              AI renders ({generations.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {generations.map((g) =>
                g.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- signed private URL
                  <img key={g.id} src={g.imageUrl} alt="" className="aspect-square w-full rounded-lg bg-white object-cover" />
                ) : (
                  <div key={g.id} className="flex aspect-square items-center justify-center rounded-lg border border-[#16263f] font-sans text-[0.55rem] uppercase tracking-[0.15em] text-[#43536e]">
                    {g.status}
                  </div>
                ),
              )}
            </div>
          </div>
        )}

        {/* Note */}
        <div className="mt-5">
          <p className="mb-2 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[#6f8199]">Note</p>
          <textarea
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== (lead.note ?? "") && onNote(note)}
            placeholder="Add context, next steps, quoted price…"
            className="w-full resize-none rounded-xl border border-[#27497A] bg-[#0d1b30] p-3 font-body text-sm text-gold-50 placeholder-[#4A6285] outline-none focus:border-gold-400"
          />
        </div>

        <button
          type="button"
          onClick={onArchive}
          className="mt-6 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[#6f8199] transition-colors hover:text-rose-300 cursor-pointer"
        >
          Archive lead
        </button>
      </div>
    </div>
  );
}
