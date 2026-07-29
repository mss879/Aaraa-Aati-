"use client";

import { useState } from "react";
import { createNote, deleteNote, updateNote } from "@/app/admin/_actions";
import type { Note, NoteColor } from "@/lib/supabase/types";
import { formatDate } from "@/lib/leads";

const COLORS: { id: NoteColor; bg: string; ring: string; dot: string }[] = [
  { id: "sapphire", bg: "#0e2a53", ring: "#2e5be0", dot: "#4f7bee" },
  { id: "amber", bg: "#332608", ring: "#8a6a1e", dot: "#f0b429" },
  { id: "emerald", bg: "#0c2b22", ring: "#1f7a5e", dot: "#34d399" },
  { id: "rose", bg: "#341019", ring: "#8a3550", dot: "#fb7185" },
  { id: "slate", bg: "#1a2436", ring: "#3a4a63", dot: "#8595ad" },
];
const colorOf = (c: NoteColor) => COLORS.find((x) => x.id === c) ?? COLORS[0];

function NoteCard({ note }: { note: Note }) {
  const [editing, setEditing] = useState(false);
  const [body, setBody] = useState(note.body);
  const c = colorOf(note.color);

  return (
    <div
      className="flex flex-col rounded-2xl border p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
      style={{ backgroundColor: c.bg, borderColor: `${c.ring}66` }}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-sans text-[0.55rem] uppercase tracking-[0.2em] text-white/40">
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
                note.pinned ? "text-gold-300" : "text-white/30 hover:text-white/70"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill={note.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.6">
                <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z" strokeLinejoin="round" />
              </svg>
            </button>
          </form>
          {/* delete */}
          <form action={deleteNote}>
            <input type="hidden" name="id" value={note.id} />
            <button
              type="submit"
              title="Delete"
              className="flex h-6 w-6 items-center justify-center rounded-full text-white/30 transition-colors hover:text-rose-300 cursor-pointer"
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
            className="w-full resize-none rounded-lg border border-white/15 bg-black/20 p-2.5 font-body text-sm text-white outline-none focus:border-white/40"
          />
          <div className="flex items-center gap-2">
            <button type="submit" className="rounded-full bg-white/15 px-3 py-1 font-sans text-[0.6rem] uppercase tracking-[0.15em] text-white hover:bg-white/25 cursor-pointer">
              Save
            </button>
            <button
              type="button"
              onClick={() => { setBody(note.body); setEditing(false); }}
              className="font-sans text-[0.6rem] uppercase tracking-[0.15em] text-white/50 hover:text-white/80 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="whitespace-pre-wrap text-left font-body text-sm leading-relaxed text-white/90 cursor-text"
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
              className="h-3.5 w-3.5 rounded-full ring-1 ring-inset ring-white/20 transition-transform hover:scale-125 cursor-pointer"
              style={{ backgroundColor: opt.dot, outline: note.color === opt.id ? "2px solid rgba(255,255,255,0.6)" : "none", outlineOffset: "1px" }}
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
        <form action={createNote} className="mb-6 rounded-2xl border border-[#16263f] bg-[#0a1526] p-4">
          <textarea
            name="body"
            rows={3}
            required
            placeholder="Jot a quick note — a call to make, a stone to source, a follow-up…"
            className="w-full resize-none rounded-lg border border-[#27497A] bg-[#0d1b30] p-3 font-body text-sm text-gold-50 placeholder-[#4A6285] outline-none focus:border-gold-400"
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
                  className="h-4 w-4 rounded-full ring-1 ring-inset ring-white/20 transition-transform hover:scale-110 cursor-pointer"
                  style={{ backgroundColor: opt.dot, outline: color === opt.id ? "2px solid rgba(255,255,255,0.7)" : "none", outlineOffset: "1px" }}
                />
              ))}
            </div>
            <button
              type="submit"
              className="rounded-full bg-gold-400 px-5 py-2 font-sans text-[0.62rem] font-semibold uppercase tracking-[0.2em] text-white transition-colors hover:bg-gold-300 cursor-pointer"
            >
              Add note
            </button>
          </div>
        </form>
      )}

      {notes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[#1d3050] bg-[#0a1526]/50 p-8 text-center font-body text-sm text-[#6f8199]">
          No notes yet.
        </p>
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
