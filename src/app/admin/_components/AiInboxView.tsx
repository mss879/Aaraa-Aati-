"use client";

import { useState } from "react";
import Link from "next/link";
import { setAiConversationStatus } from "@/app/admin/_actions";
import type { AiConversationStatus, AiConversationWithMessages } from "@/lib/supabase/types";
import { formatDate } from "@/lib/leads";

/**
 * The AI Inbox — every conversation the concierge has held, and what came of it.
 *
 * Read like the other two inboxes (list left, detail right), with one addition
 * that matters more than the rest: the captured badge. A thread where Amara took
 * a name and number is already a card in the CRM, so this view's job is to show
 * WHICH threads converted and to let the maison read the words that got them
 * there. The transcript is the product; the status flags are housekeeping.
 */

const STATUS_DOT: Record<AiConversationStatus, string> = {
  new: "#f0b429",
  read: "#4f7bee",
  archived: "#43536e",
};

type Filter = "all" | "captured" | AiConversationStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "captured", label: "Captured" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "archived", label: "Archived" },
];

export default function AiInboxView({
  conversations,
}: {
  conversations: AiConversationWithMessages[];
}) {
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(conversations[0]?.id ?? null);

  const shown = conversations.filter((c) =>
    filter === "all" ? true : filter === "captured" ? Boolean(c.lead_id) : c.status === filter,
  );
  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  /* The first thing the visitor actually typed — a far better label for a thread
     than a session UUID, which tells a reader nothing. */
  const preview = (c: AiConversationWithMessages) =>
    c.messages.find((m) => m.role === "user")?.content ?? "No message yet";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
      {/* List */}
      <div className="lg:col-span-2">
        <div className="mb-3 flex flex-wrap gap-1.5">
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
            No conversations here yet.
          </p>
        ) : (
          <div className="space-y-2">
            {shown.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedId(c.id)}
                className={`w-full rounded-xl border p-3.5 text-left transition-colors ${
                  selectedId === c.id
                    ? "border-[var(--adm-accent)] bg-[var(--adm-accent-tint)]"
                    : "border-[var(--adm-line)] bg-white hover:border-[var(--adm-line-strong)]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex min-w-0 items-center gap-2 font-body text-sm text-[var(--adm-ink)]">
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: STATUS_DOT[c.status] }}
                    />
                    <span className="truncate">{c.visitor_name ?? "Anonymous visitor"}</span>
                  </span>
                  <span className="shrink-0 font-body text-[0.62rem] text-[var(--adm-muted)]">
                    {formatDate(c.last_message_at ?? c.created_at)}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 font-body text-[0.72rem] text-[var(--adm-ink-soft)]">
                  {preview(c)}
                </p>
                <div className="mt-1.5 flex items-center gap-3">
                  <span className="font-sans text-[0.6rem] uppercase tracking-[0.12em] text-[var(--adm-muted)]">
                    {c.message_count} message{c.message_count === 1 ? "" : "s"}
                  </span>
                  {c.lead_id && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 font-sans text-[0.6rem] uppercase tracking-[0.12em] text-emerald-600">
                      In CRM
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
            Select a conversation to read it.
          </p>
        ) : (
          <div className="adm-card p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl font-light text-[var(--adm-ink)]">
                  {selected.visitor_name ?? "Anonymous visitor"}
                </h2>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 font-body text-[0.8rem]">
                  {selected.visitor_phone && (
                    <a
                      href={`tel:${selected.visitor_phone}`}
                      className="text-[var(--adm-accent-strong)] hover:text-[var(--adm-accent)]"
                    >
                      {selected.visitor_phone}
                    </a>
                  )}
                  {selected.visitor_email && (
                    <a
                      href={`mailto:${selected.visitor_email}`}
                      className="text-[var(--adm-accent-strong)] hover:text-[var(--adm-accent)]"
                    >
                      {selected.visitor_email}
                    </a>
                  )}
                  {!selected.visitor_phone && !selected.visitor_email && (
                    <span className="text-[var(--adm-muted)]">No details given</span>
                  )}
                </div>
              </div>

              <div className="flex gap-1.5">
                {(["new", "read", "archived"] as AiConversationStatus[]).map((s) => (
                  <form key={s} action={setAiConversationStatus}>
                    <input type="hidden" name="id" value={selected.id} />
                    <input type="hidden" name="status" value={s} />
                    <button
                      type="submit"
                      className={`adm-chip ${selected.status === s ? "adm-chip-on" : ""}`}
                    >
                      {s[0]!.toUpperCase() + s.slice(1)}
                    </button>
                  </form>
                ))}
              </div>
            </div>

            {/* What the agent made of them, and where they went */}
            {selected.qualification && (
              <div className="mt-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
                <p className="font-sans text-[0.6rem] uppercase tracking-[0.2em] text-emerald-700">
                  Concierge’s note
                </p>
                <p className="mt-1.5 font-body text-[0.82rem] leading-relaxed text-[var(--adm-ink)]">
                  {selected.qualification}
                </p>
                {selected.lead_id && (
                  <Link
                    href="/admin/crm"
                    className="mt-2 inline-block font-sans text-[0.62rem] uppercase tracking-[0.18em] text-[var(--adm-accent-strong)] hover:text-[var(--adm-accent)]"
                  >
                    Open in CRM pipeline →
                  </Link>
                )}
              </div>
            )}

            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 border-t border-[var(--adm-line)] pt-4 font-body text-[0.75rem]">
              <div className="flex justify-between">
                <dt className="text-[var(--adm-muted)]">Started</dt>
                <dd className="text-[var(--adm-ink)]">{formatDate(selected.created_at)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--adm-muted)]">Opened on</dt>
                <dd className="truncate pl-2 text-[var(--adm-ink)]">{selected.page_path ?? "—"}</dd>
              </div>
            </dl>

            {/* Transcript */}
            <p className="mt-6 font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[var(--adm-muted)]">
              Transcript
            </p>
            <div className="mt-3 max-h-[26rem] space-y-2.5 overflow-y-auto rounded-xl border border-[var(--adm-line)] bg-[var(--adm-inset)] p-4">
              {selected.messages.length === 0 ? (
                <p className="text-center font-body text-sm text-[var(--adm-muted)]">
                  No messages recorded.
                </p>
              ) : (
                selected.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[82%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 font-body text-[0.8rem] leading-relaxed ${
                        m.role === "user"
                          ? "rounded-br-sm bg-[var(--adm-accent)] text-white"
                          : "rounded-bl-sm border border-[var(--adm-line)] bg-white text-[var(--adm-ink)]"
                      }`}
                    >
                      {m.content}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
