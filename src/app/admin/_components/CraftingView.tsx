"use client";

import { useState } from "react";
import Link from "next/link";
import { promoteCraftRequest, setCraftStatus, updateCraftNote } from "@/app/admin/_actions";
import type { CraftRequestWithRenders } from "@/lib/admin/data";
import type { CraftRequestStatus } from "@/lib/supabase/types";
import { configSummary, formatDate, formatPrice } from "@/lib/leads";

/**
 * The Crafting inbox — bespoke commissions opened at the atelier gate. Same
 * shape as InquiriesView (list + detail + "Send to CRM"), but a commission
 * carries a design: its configuration, an estimate, and every AI render the
 * visitor made while they were in the studio.
 */

const STATUS_DOT: Record<CraftRequestStatus, string> = {
  new: "#f0b429",
  read: "#4f7bee",
  archived: "#43536e",
};

const FILTERS: { id: "all" | CraftRequestStatus; label: string }[] = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "archived", label: "Archived" },
];

export default function CraftingView({ requests }: { requests: CraftRequestWithRenders[] }) {
  const [filter, setFilter] = useState<"all" | CraftRequestStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(requests[0]?.id ?? null);

  const shown = requests.filter((r) => filter === "all" || r.status === filter);
  const selected = requests.find((r) => r.id === selectedId) ?? null;

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
              className={`adm-chip ${filter === f.id ? "adm-chip-on" : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {shown.length === 0 ? (
          <p className="adm-empty p-8 text-center font-body text-sm text-[var(--adm-muted)]">
            No commissions here.
          </p>
        ) : (
          <div className="space-y-2">
            {shown.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelectedId(r.id)}
                className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                  selectedId === r.id
                    ? "border-[var(--adm-accent)] bg-[var(--adm-accent-tint)]"
                    : "border-[var(--adm-line)] bg-white hover:border-[var(--adm-line-strong)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 font-body text-sm text-[var(--adm-ink)]">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: STATUS_DOT[r.status] }}
                    />
                    {r.name}
                  </span>
                  <span className="font-body text-[0.62rem] text-[var(--adm-muted)]">
                    {formatDate(r.created_at)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 font-body text-[0.72rem] text-[var(--adm-ink-soft)]">
                  {configSummary(r.config)}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.12em] text-[var(--adm-accent)]">
                    {formatPrice(r.estimated_price)}
                  </span>
                  {r.renders.length > 0 && (
                    <span className="font-sans text-[0.6rem] uppercase tracking-[0.12em] text-[var(--adm-muted)]">
                      {r.renders.length} render{r.renders.length === 1 ? "" : "s"}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail */}
      <div className="lg:col-span-3">
        {!selected ? (
          <p className="adm-empty p-10 text-center font-body text-sm text-[var(--adm-muted)]">
            Select a commission to open it.
          </p>
        ) : (
          <div className="adm-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-serif text-2xl font-light text-[var(--adm-ink)]">{selected.name}</h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-[0.8rem]">
                  <a href={`tel:${selected.phone}`} className="text-[var(--adm-accent-strong)] hover:text-[var(--adm-accent)]">
                    {selected.phone}
                  </a>
                  {selected.email && (
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-[var(--adm-accent-strong)] hover:text-[var(--adm-accent)]"
                    >
                      {selected.email}
                    </a>
                  )}
                </div>
              </div>
              <span className="font-body text-[0.66rem] text-[var(--adm-muted)]">
                {formatDate(selected.created_at)}
              </span>
            </div>

            {/* The design itself */}
            <div className="mt-5 adm-inset p-4">
              <p className="adm-label">
                The design
              </p>
              <p className="mt-2 font-body text-sm leading-relaxed text-[var(--adm-ink-soft)]">
                {configSummary(selected.config)}
              </p>
              <p className="mt-2 font-serif text-xl font-light text-[var(--adm-ink)]">
                {formatPrice(selected.estimated_price)}
                <span className="ml-2 font-sans text-[0.58rem] uppercase tracking-[0.2em] text-[var(--adm-muted)]">
                  estimate
                </span>
              </p>
            </div>

            {/* Renders they made in the studio */}
            {selected.renders.length > 0 && (
              <div className="mt-5">
                <p className="adm-label">
                  Their renders
                </p>
                <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                  {selected.renders.map((render) => (
                    <div
                      key={render.id}
                      className="aspect-square overflow-hidden rounded-lg border border-[var(--adm-line)] bg-white"
                    >
                      {render.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element -- signed private URL
                        <img
                          src={render.imageUrl}
                          alt="AI render"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center bg-white font-sans text-[0.55rem] uppercase tracking-[0.18em] text-[var(--adm-muted)]">
                          {render.status === "failed" ? "failed" : "no image"}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Concierge note */}
            <form action={updateCraftNote} className="mt-5">
              <input type="hidden" name="id" value={selected.id} />
              <label
                htmlFor={`craft-note-${selected.id}`}
                className="adm-label"
              >
                Note
              </label>
              <textarea
                id={`craft-note-${selected.id}`}
                name="note"
                rows={3}
                defaultValue={selected.note ?? ""}
                key={selected.id}
                placeholder="Stones to source, call-back time, what they said on the phone…"
                className="mt-2 w-full resize-none rounded-xl border border-[var(--adm-line)] bg-[var(--adm-inset)] px-3.5 py-2.5 font-body text-[0.82rem] text-[var(--adm-ink)] outline-none transition-colors placeholder:text-[var(--adm-faint)] focus:border-[var(--adm-accent)]"
              />
              <button
                type="submit"
                className="mt-2 adm-btn-ghost"
              >
                Save note
              </button>
            </form>

            <div className="mt-7 flex flex-wrap items-center gap-2 border-t border-[var(--adm-line)] pt-5">
              {selected.promoted_lead_id ? (
                <Link
                  href="/admin/crm"
                  className="rounded-full bg-emerald-50 px-4 py-2 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-emerald-700 ring-1 ring-inset ring-emerald-200"
                >
                  ✓ In CRM — open board
                </Link>
              ) : (
                <form action={promoteCraftRequest}>
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
                <form action={setCraftStatus}>
                  <input type="hidden" name="id" value={selected.id} />
                  <input type="hidden" name="status" value="read" />
                  <button
                    type="submit"
                    className="adm-btn-ghost"
                  >
                    Mark read
                  </button>
                </form>
              )}
              {selected.status !== "archived" && (
                <form action={setCraftStatus}>
                  <input type="hidden" name="id" value={selected.id} />
                  <input type="hidden" name="status" value="archived" />
                  <button
                    type="submit"
                    className="rounded-full border border-[var(--adm-line)] px-4 py-2.5 font-sans text-[0.62rem] uppercase tracking-[0.16em] text-[var(--adm-ink-soft)] transition-colors hover:border-rose-400/40 hover:text-[var(--adm-danger)] cursor-pointer"
                  >
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
