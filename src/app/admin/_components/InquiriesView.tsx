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
                filter === f.id ? "bg-gold-500/20 text-gold-100 ring-1 ring-inset ring-gold-400/30" : "text-[#8595ad] hover:text-gold-100"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#1d3050] bg-[#0a1526]/50 p-8 text-center font-body text-sm text-[#6f8199]">
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
                    ? "border-gold-400/50 bg-[#0c1a30]"
                    : "border-[#16263f] bg-[#0a1526] hover:border-[#27497A]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-body text-sm text-gold-50">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT[i.status] }} />
                    {i.name}
                  </span>
                  <span className="font-body text-[0.62rem] text-[#6f8199]">{formatDate(i.created_at)}</span>
                </div>
                {i.interest && (
                  <p className="mt-1 font-sans text-[0.6rem] uppercase tracking-[0.12em] text-gold-400/80">{i.interest}</p>
                )}
                <p className="mt-1 line-clamp-1 font-body text-[0.72rem] text-[#8595ad]">{i.message}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="lg:col-span-3">
        {!selected ? (
          <p className="rounded-2xl border border-dashed border-[#1d3050] bg-[#0a1526]/50 p-10 text-center font-body text-sm text-[#6f8199]">
            Select an inquiry to read it.
          </p>
        ) : (
          <div className="rounded-2xl border border-[#16263f] bg-[#0a1526] p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-light text-gold-50">{selected.name}</h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-[0.8rem]">
                  <a href={`mailto:${selected.email}`} className="text-gold-200 hover:text-gold-300">{selected.email}</a>
                  {selected.phone && <a href={`tel:${selected.phone}`} className="text-gold-200 hover:text-gold-300">{selected.phone}</a>}
                </div>
              </div>
              <span className="font-body text-[0.66rem] text-[#6f8199]">{formatDate(selected.created_at)}</span>
            </div>

            {selected.interest && (
              <p className="mt-4 inline-block rounded-full bg-gold-500/15 px-3 py-1 font-sans text-[0.6rem] uppercase tracking-[0.14em] text-gold-200">
                {selected.interest}
              </p>
            )}

            <p className="mt-4 whitespace-pre-wrap font-body text-sm leading-relaxed text-[#c9d4e6]">
              {selected.message}
            </p>

            {selected.source_piece && (
              <p className="mt-3 font-body text-[0.68rem] text-[#6f8199]">
                Interested in: {selected.source_piece}
              </p>
            )}

            <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-[#16263f] pt-5">
              {selected.promoted_lead_id ? (
                <Link
                  href="/admin/crm"
                  className="rounded-full bg-emerald-500/15 px-4 py-2 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-300 ring-1 ring-inset ring-emerald-400/30"
                >
                  ✓ In CRM — open board
                </Link>
              ) : (
                <form action={promoteInquiry}>
                  <input type="hidden" name="id" value={selected.id} />
                  <button
                    type="submit"
                    className="rounded-full bg-gold-400 px-5 py-2.5 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-gold-300 cursor-pointer"
                  >
                    Send to CRM →
                  </button>
                </form>
              )}

              {selected.status !== "read" && (
                <form action={setInquiryStatus}>
                  <input type="hidden" name="id" value={selected.id} />
                  <input type="hidden" name="status" value="read" />
                  <button type="submit" className="rounded-full border border-[#27497A] px-4 py-2.5 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-[#c9d4e6] transition-colors hover:border-gold-400/50 hover:text-gold-200 cursor-pointer">
                    Mark read
                  </button>
                </form>
              )}
              {selected.status !== "archived" && (
                <form action={setInquiryStatus}>
                  <input type="hidden" name="id" value={selected.id} />
                  <input type="hidden" name="status" value="archived" />
                  <button type="submit" className="rounded-full border border-[#27497A] px-4 py-2.5 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-[#8595ad] transition-colors hover:border-rose-400/40 hover:text-rose-300 cursor-pointer">
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
