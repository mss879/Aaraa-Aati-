"use client";

import { useState } from "react";
import Link from "next/link";
import { promoteInquiry, setInquiryStatus } from "@/app/admin/_actions";
import type { Inquiry, InquiryStatus } from "@/lib/supabase/types";
import { formatDate } from "@/lib/leads";

const STATUS_DOT: Record<InquiryStatus, string> = {
  new: "#f0b429",
  read: "#4f7bee",
  archived: "#43536e",
};

const FILTERS: { id: "all" | InquiryStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "archived", label: "Archived" },
];

export default function InquiriesView({ inquiries }: { inquiries: Inquiry[] }) {
  const [filter, setFilter] = useState<"all" | InquiryStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(inquiries[0]?.id ?? null);

  const shown = inquiries.filter((i) => filter === "all" || i.status === filter);
  const selected = inquiries.find((i) => i.id === selectedId) ?? null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* List */}
      <div className="lg:col-span-2">
        <div className="mb-3 flex gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full px-3 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.14em] transition-colors cursor-pointer ${
                filter === f.id ? "bg-[var(--adm-accent-tint)] text-[var(--adm-ink)] ring-1 ring-inset ring-[var(--adm-accent)]/30" : "text-[var(--adm-ink-soft)] hover:text-[var(--adm-ink)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="adm-empty p-8 text-center font-body text-sm text-[var(--adm-muted)]">
            No inquiries here.
          </p>
        ) : (
          <div className="space-y-2">
            {shown.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setSelectedId(i.id)}
                className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                  selectedId === i.id
                    ? "border-[var(--adm-accent)] bg-[var(--adm-accent-tint)]"
                    : "border-[var(--adm-line)] bg-white hover:border-[var(--adm-line-strong)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-body text-sm text-[var(--adm-ink)]">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT[i.status] }} />
                    {i.name}
                  </span>
                  <span className="font-body text-[0.62rem] text-[var(--adm-muted)]">{formatDate(i.created_at)}</span>
                </div>
                {i.interest && (
                  <p className="mt-1 font-sans text-[0.6rem] uppercase tracking-[0.12em] text-[var(--adm-accent)]">{i.interest}</p>
                )}
                <p className="mt-1 line-clamp-1 font-body text-[0.72rem] text-[var(--adm-ink-soft)]">{i.message}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="lg:col-span-3">
        {!selected ? (
          <p className="adm-empty p-10 text-center font-body text-sm text-[var(--adm-muted)]">
            Select an inquiry to read it.
          </p>
        ) : (
          <div className="adm-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-light text-[var(--adm-ink)]">{selected.name}</h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-[0.8rem]">
                  <a href={`mailto:${selected.email}`} className="text-[var(--adm-accent-strong)] hover:text-[var(--adm-accent)]">{selected.email}</a>
                  {selected.phone && <a href={`tel:${selected.phone}`} className="text-[var(--adm-accent-strong)] hover:text-[var(--adm-accent)]">{selected.phone}</a>}
                </div>
              </div>
              <span className="font-body text-[0.66rem] text-[var(--adm-muted)]">{formatDate(selected.created_at)}</span>
            </div>

            {selected.interest && (
              <p className="mt-4 inline-block rounded-full bg-[var(--adm-accent-tint)] px-3 py-1 font-sans text-[0.6rem] uppercase tracking-[0.14em] text-[var(--adm-accent-strong)]">
                {selected.interest}
              </p>
            )}

            <p className="mt-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-[var(--adm-ink-soft)]">
              {selected.message}
            </p>

            {selected.source_piece && (
              <p className="mt-3 font-body text-[0.68rem] text-[var(--adm-muted)]">
                Interested in: {selected.source_piece}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-[var(--adm-line)] pt-5">
              {selected.promoted_lead_id ? (
                <Link
                  href="/admin/crm"
                  className="rounded-full bg-emerald-50 px-4 py-2 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-700 ring-1 ring-inset ring-emerald-200"
                >
                  ✓ In CRM — open board
                </Link>
              ) : (
                <form action={promoteInquiry}>
                  <input type="hidden" name="id" value={selected.id} />
                  <button
                    type="submit"
                    className="adm-btn"
                  >
                    Send to CRM →
                  </button>
                </form>
              )}

              {selected.status !== "read" && (
                <form action={setInquiryStatus}>
                  <input type="hidden" name="id" value={selected.id} />
                  <input type="hidden" name="status" value="read" />
                  <button type="submit" className="adm-btn-ghost">
                    Mark read
                  </button>
                </form>
              )}
              {selected.status !== "archived" && (
                <form action={setInquiryStatus}>
                  <input type="hidden" name="id" value={selected.id} />
                  <input type="hidden" name="status" value="archived" />
                  <button type="submit" className="rounded-full border border-[var(--adm-line)] px-4 py-2.5 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-[var(--adm-ink-soft)] transition-colors hover:border-rose-400/40 hover:text-[var(--adm-danger)] cursor-pointer">
                    Archive
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
