"use client";

import { useState } from "react";
import { createNote, deleteNote, updateNote } from "@/app/admin/_actions";
import type { Note, NoteColor } from "@/lib/supabase/types";
import { formatDate } from "@/lib/leads";

/**
 * The scratchpad. In daylight a note is a tinted card rather than a coloured
 * block: the paper stays near-white so the handwriting (navy, like everything
 * else) is what you read, and the colour lives in the wash, the hairline and
 * the dot. Sapphire is the default because it is the house's own.
 */
const COLORS: { id: NoteColor; bg: string; line: string; dot: string }[] = [
  { id: "sapphire", bg: "#eef3fe", line: "#c5d6fb", dot: "#2e5be0" },
  { id: "amber", bg: "#fdf5e6", line: "#f0dcb2", dot: "#e0a020" },
  { id: "emerald", bg: "#eaf7f1", line: "#bde3d2", dot: "#12a06e" },
  { id: "rose", bg: "#fdeef1", line: "#f6cbd5", dot: "#e04f6d" },
  { id: "slate", bg: "#f2f5fa", line: "#dbe3ef", dot: "#7b8ca9" },
];
const colorOf = (c: NoteColor) => COLORS.find((x) => x.id === c) ?? COLORS[0];

function NoteCard({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(note.body);
  const c = colorOf(note.color);

  return (
    <div
      className="flex flex-col rounded-2xl border p-4 shadow-[var(--adm-shadow)]"
      style={{ backgroundColor: c.bg, borderColor: c.line }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-[var(--adm-muted)]">
          {formatDate(note.updated_at)}
        </span>
        <div className="flex items-center gap-1.5">
          {/* pin */}
          <form action={updateNote}>
            <input type="hidden" name="id" value={note.id} />
            <input type="hidden" name="pinned" value={(!note.pinned).toString()} />
            <button
              type="submit"
              title={note.pinned ? "Unpin" : "Pin"}
              className={`flex h-6 w-6 items-center justify-center rounded-full transition-colors cursor-pointer ${
                note.pinned
                  ? "text-[var(--adm-accent)]"
                  : "text-[var(--adm-faint)] hover:text-[var(--adm-ink-soft)]"
              }`}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill={note.pinned ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>
          {/* delete */}
          <form action={deleteNote}>
            <input type="hidden" name="id" value={note.id} />
            <button
              type="submit"
              title="Delete"
              className="flex h-6 w-6 items-center justify-center rounded-full text-[var(--adm-faint)] transition-colors hover:text-[var(--adm-danger)] cursor-pointer"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      {editing ? (
        <form action={updateNote} className="flex flex-col gap-2">
          <input type="hidden" name="id" value={note.id} />
          <textarea
            name="body"
            rows={4}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="adm-field resize-none"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="rounded-full bg-white px-3.5 py-1.5 font-sans text-[0.6rem] uppercase tracking-[0.15em] text-[var(--adm-ink)] ring-1 ring-inset ring-[var(--adm-line)] transition-colors hover:text-[var(--adm-accent)] cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setBody(note.body);
                setEditing(false);
              }}
              className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-[var(--adm-muted)] hover:text-[var(--adm-ink)] cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="whitespace-pre-wrap text-left font-body text-sm leading-relaxed text-[var(--adm-ink)] cursor-text"
        >
          {note.body || "Empty note — click to edit"}
        </button>
      )}

      {/* color row */}
      <div className="mt-3 flex items-center gap-1.5 pt-2">
        {COLORS.map((opt) => (
          <form action={updateNote} key={opt.id}>
            <input type="hidden" name="id" value={note.id} />
            <input type="hidden" name="color" value={opt.id} />
            <button
              type="submit"
              title={opt.id}
              className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-black/10 transition-transform hover:scale-125 cursor-pointer"
              style={{
                backgroundColor: opt.dot,
                outline: note.color === opt.id ? "2px solid rgba(19,41,75,0.35)" : "none",
                outlineOffset: "1px",
              }}
            />
          </form>
        ))}
      </div>
    </div>
  );
}

export default function NotesBoard({ notes, compact = false }: { notes: Note[]; compact?: boolean }) {
  const [color, setColor] = useState<NoteColor>("sapphire");

  return (
    <div>
      {!compact && (
        <form action={createNote} className="adm-card mb-6 p-4">
          <textarea
            name="body"
            rows={3}
            required
            placeholder="Jot a quick note — a call to make, a stone to source, a follow-up…"
            className="adm-field resize-none"
          />
          <input type="hidden" name="color" value={color} />
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {COLORS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setColor(opt.id)}
                  title={opt.id}
                  className="h-4 w-4 rounded-full ring-1 ring-inset ring-black/10 transition-transform hover:scale-110 cursor-pointer"
                  style={{
                    backgroundColor: opt.dot,
                    outline: color === opt.id ? "2px solid rgba(19,41,75,0.35)" : "none",
                    outlineOffset: "1px",
                  }}
                />
              ))}
            </div>
            <button type="submit" className="adm-btn">
              Add note
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="adm-empty p-8 text-center font-body text-sm">No notes yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
