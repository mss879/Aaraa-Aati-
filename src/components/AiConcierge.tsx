"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import usePastHero from "@/hooks/usePastHero";

/**
 * AiConcierge
 * The floating chat agent — Amara. Sits bottom-right in the space reserved by
 * `--agent-h` in globals.css, with the Book/WhatsApp buttons stacked above her.
 * Her closed state is a sapphire cut to the house CTA silhouette (.gem-fab),
 * the primary stone under those two — and like them she stays off the hero
 * until the visitor has scrolled past it.
 *
 * She answers in plain text by instruction (see lib/ai/agent-context.ts), so
 * this renders text, not markdown — with one exception: URLs become links,
 * because the booking link is the single most important thing she ever says and
 * an unclickable one is a dead end.
 *
 * The session id lives in sessionStorage so a refresh continues the same
 * conversation rather than opening a second orphaned transcript in the inbox.
 */

const SESSION_KEY = "cgm_ai_session";

type Message = { id: string; role: "user" | "assistant"; content: string };

const OPENING: Message = {
  id: "opening",
  role: "assistant",
  content:
    "Good day, and welcome to Ceylon Gem Maison. I am Amara, the house concierge.\n\nAre you looking for something in particular — an engagement ring, a gift, or a stone you have in mind?",
};

const PROMPTS = [
  "Design an engagement ring",
  "Book a consultation",
  "How are your stones sourced?",
];

/** Splits a run of text into plain spans and anchors, so URLs stay clickable. */
function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s<>()]+)/g);
  return (
    <>
      {parts.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="break-words font-medium text-gold-200 underline underline-offset-2 transition-colors hover:text-gold-100"
          >
            {part.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

export default function AiConcierge() {
  const [open, setOpen] = useState(false);
  /* Sticks once she has been opened: having met her, hiding her again on the
     way back up the page would be taking the concierge away mid-errand. */
  const [engaged, setEngaged] = useState(false);
  const [messages, setMessages] = useState<Message[]>([OPENING]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState(false);

  const sessionRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  /* She waits out the hero with the rest of the stack — see usePastHero. */
  const pastHero = usePastHero();
  const visible = pastHero || engaged;

  /* One id per browser session, surviving reloads so the inbox sees one thread. */
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        sessionRef.current = saved;
        return;
      }
      const fresh = crypto.randomUUID();
      sessionStorage.setItem(SESSION_KEY, fresh);
      sessionRef.current = fresh;
    } catch {
      sessionRef.current = crypto.randomUUID(); // private mode — thread won't survive a reload
    }
  }, []);

  /* Follow the conversation down as it grows, and land the caret in the field
     when she opens, so answering never needs a click first. */
  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, open]);

  /* Focus only — the unread dot is cleared by the act of opening (see the
     bubble's handler), because that is a user event, not a synchronisation. */
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  /* A single dot on the gem once someone has been reading a while — the nudge a
     maître d' gives by catching your eye, rather than a pop-up that lands across
     whatever they were looking at. Fires once, never again, and only starts
     counting once she is actually on screen: a dot that arrives pre-lit has not
     caught anybody's eye. */
  const [nudged, setNudged] = useState(false);
  useEffect(() => {
    if (nudged || open || !visible) return;
    const id = setTimeout(() => {
      setUnread(true);
      setNudged(true);
    }, 20000);
    return () => clearTimeout(id);
  }, [nudged, open, visible]);

  /* Escape closes her. Unlike the atelier's details prompt this is a
     convenience, not a gate — trapping someone in a chat window would be rude. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || sending) return;

      const mine: Message = { id: `u-${Date.now()}`, role: "user", content: trimmed };
      const history = [...messages, mine];
      setMessages(history);
      setInput("");
      setSending(true);
      setError(null);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            // The scripted opening is ours, not hers — sending it back would
            // have her treat her own greeting as conversation history.
            messages: history
              .filter((m) => m.id !== "opening")
              .map((m) => ({ role: m.role, content: m.content })),
            sessionId: sessionRef.current,
            pagePath: pathname,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || "The concierge is unavailable for a moment.");

        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: "assistant", content: String(data.content ?? "") },
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      } finally {
        setSending(false);
      }
    },
    [messages, pathname, sending],
  );

  /* Never over the back office — that is staff tooling, not a shopfront. */
  if (pathname?.startsWith("/admin")) return null;

  return (
    <>
      {/* ---------------------------------------------------------- panel --- */}
      {open && (
        <div
          role="dialog"
          aria-label="Chat with Amara, the Ceylon Gem Maison concierge"
          className="fixed inset-x-3 bottom-3 z-50 flex h-[min(34rem,calc(100svh-5rem))] flex-col overflow-hidden rounded-2xl border border-[#2A4C80] bg-[#0A1F3D] shadow-[0_24px_70px_rgba(3,10,28,0.6)] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:w-[23rem]"
        >
          {/* header */}
          <div className="flex items-center gap-3 border-b border-[#1D3D6B] bg-[#0C2447] px-4 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold-400/40 bg-[#123566] font-serif text-sm text-gold-200">
              A
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-serif text-sm font-light tracking-wide text-gold-50">Amara</p>
              <p className="flex items-center gap-1.5 font-sans text-[0.55rem] uppercase tracking-[0.2em] text-[#7186AC]">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Concierge · replies instantly
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close the chat"
              className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#7186AC] transition-colors hover:bg-white/5 hover:text-gold-200"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* transcript */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 font-body text-[0.83rem] leading-relaxed ${
                    m.role === "user"
                      ? "rounded-br-sm bg-gold-400 text-white"
                      : "rounded-bl-sm border border-[#27497A] bg-[#0F2A50] text-[#D6E0F0]"
                  }`}
                >
                  <Linkified text={m.content} />
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex justify-start" aria-live="polite" aria-label="Amara is typing">
                <div className="flex gap-1 rounded-2xl rounded-bl-sm border border-[#27497A] bg-[#0F2A50] px-4 py-3">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-gold-300/70"
                      style={{ animationDelay: `${i * 140}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="px-1 font-body text-[0.75rem] text-rose-300">
                {error}
              </p>
            )}

            {/* Openers, shown only before the visitor has said anything — a blank
                box asks people to invent a question; these answer that for them. */}
            {messages.length === 1 && !sending && (
              <div className="space-y-1.5 pt-1">
                {PROMPTS.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => send(p)}
                    className="block w-full cursor-pointer rounded-xl border border-[#27497A] bg-white/[0.02] px-3.5 py-2 text-left font-body text-[0.78rem] text-[#A9B8D0] transition-colors hover:border-gold-400/50 hover:text-gold-100"
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-[#1D3D6B] bg-[#0C2447] px-3 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a stone, a design, a date…"
              aria-label="Your message"
              maxLength={2000}
              className="min-w-0 flex-1 rounded-full border border-[#27497A] bg-[#0A1F3D] px-4 py-2.5 font-body text-[0.83rem] text-white outline-none transition-colors placeholder:text-[#5E7495] focus:border-gold-400"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gold-400 text-white transition-all hover:bg-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.5 4.5l17 7.5-17 7.5L6 12zm0 0h6" />
              </svg>
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------ gem --- */}
      {/* The wrapper carries the position, not the button: clip-path crops
          descendants too, so an unread dot placed on the stone itself would be
          sliced off by the facet it sits over. */}
      {!open && (
        <div
          /* flex, not block: an inline-flex button in a block box sits on a
             baseline and leaves a few pixels of descender space beneath it,
             which would put the gem off the corner margin --agent-h assumes. */
          className={`fixed bottom-3 right-3 z-50 flex transition-all duration-500 md:bottom-5 md:right-5 ${
            visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
          }`}
          aria-hidden={!visible}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(true);
              setEngaged(true);
              setUnread(false);
            }}
            aria-label="Chat with Amara, the Ceylon Gem Maison concierge"
            tabIndex={visible ? undefined : -1}
            className="gem-fab gem-fab--sapphire"
          >
            <svg className="gem-fab__icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10.5h8M8 14h5M21 12a8.5 8.5 0 01-12.4 7.55L3 21l1.45-5.6A8.5 8.5 0 1121 12z"
              />
            </svg>
            <span className="gem-fab__label">Ask Amara</span>
          </button>
          {unread && (
            <span className="pointer-events-none absolute -top-1 right-2.5 h-3 w-3 rounded-full border-2 border-[#0A1F3D] bg-gold-300 md:right-3" />
          )}
        </div>
      )}
    </>
  );
}
