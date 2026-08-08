"use client";

import { usePathname } from "next/navigation";
import usePastHero from "@/hooks/usePastHero";
import { BOOKING_URL, WHATSAPP_DISPLAY, whatsAppLink } from "@/lib/contact";

/**
 * FloatingActions
 * The two live ways to reach a person, parked at the right edge above the AI
 * concierge: book the concierge's diary, or open WhatsApp.
 *
 * Both are cut from the house CTA silhouette (.gem-fab in globals.css) rather
 * than being round chat-widget discs — the diary in the secondary CTA's platinum
 * glass, WhatsApp as an emerald set in the same metal, and Amara below in
 * sapphire. Three stones from one setting instead of three unrelated buttons.
 *
 * The concierge's own headroom is reserved as `--agent-h` in globals.css and
 * this stack sits on top of that reservation — if her gem is resized, one
 * variable moves both buttons rather than every offset needing a re-guess.
 *
 * Collapsed to the stone alone by default so they never compete with the
 * jewellery. The label unfurls on hover and on keyboard focus — focus matters,
 * or the buttons are unlabelled to anyone who does not use a mouse.
 */

type Action = {
  label: string;
  href: string;
  /** Announced to screen readers, where "Book" alone says too little. */
  aria: string;
  icon: React.ReactNode;
  /** WhatsApp keeps its own green: it is a brand mark people scan for. */
  material: "platinum" | "emerald";
};

const CalendarIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="gem-fab__icon">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
    />
  </svg>
);

const WhatsAppGlyph = (
  <svg viewBox="0 0 24 24" fill="currentColor" className="gem-fab__icon">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

const ACTIONS: Action[] = [
  {
    label: "Book a meeting",
    href: BOOKING_URL,
    aria: "Book a 30-minute consultation with the atelier concierge (opens Calendly in a new tab)",
    icon: CalendarIcon,
    material: "platinum",
  },
  {
    label: "WhatsApp us",
    href: whatsAppLink("Hello Ceylon Gem Maison — I would like to speak with the concierge."),
    aria: `Message the atelier on WhatsApp at ${WHATSAPP_DISPLAY} (opens in a new tab)`,
    icon: WhatsAppGlyph,
    material: "emerald",
  },
];

export default function FloatingActions() {
  /* Held back until the hero is behind us. Arriving with the page puts three
     bright objects on the one frame composed to be looked at; arriving after it
     reads as an offer made at the moment someone started browsing. */
  const shown = usePastHero();

  /* The admin CRM nests inside the public root layout, so without this the
     staff running the maison would be invited to book a meeting with
     themselves — over their own order list, in a light theme these gems were
     never cut for. */
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div
      className={`fixed right-3 z-40 flex flex-col items-end gap-2.5 transition-all duration-500 md:right-5 md:gap-3 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"
      }`}
      /* Sits directly on the headroom reserved for the concierge gem. */
      style={{ bottom: "calc(var(--agent-h) + 0.6rem)" }}
      aria-hidden={!shown}
    >
      {ACTIONS.map((action) => (
        <a
          key={action.label}
          href={action.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={action.aria}
          /* Not focusable while the stack is hidden — a tab stop on an
             invisible button strands keyboard users on the hero. */
          tabIndex={shown ? undefined : -1}
          className={`gem-fab gem-fab--${action.material}`}
        >
          {action.icon}
          <span className="gem-fab__label">{action.label}</span>
        </a>
      ))}
    </div>
  );
}
