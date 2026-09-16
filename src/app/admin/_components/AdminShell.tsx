"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/_actions";

/**
 * The back office is two businesses under one roof, so the sidebar says so: the
 * maison's commission work up top (pipeline, the two inboxes that feed it, the
 * scratchpad), and the shop below it in its own tinted panel under an
 * E-COMMERCE heading. Same shell, two clearly separated halves.
 */

export type NavBadges = {
  inquiries: number;
  crafting: number;
  aiInbox: number;
  orders: number;
};

type NavItem = {
  href: string;
  label: string;
  icon: string;
  exact?: boolean;
  badge?: keyof NavBadges;
};

const SECTIONS: { heading?: string; tone?: "ecom"; items: NavItem[] }[] = [
  {
    items: [{ href: "/admin", label: "Dashboard", icon: "grid", exact: true }],
  },
  {
    heading: "Maison",
    items: [
      { href: "/admin/crm", label: "CRM Pipeline", icon: "pipeline" },
      { href: "/admin/inquiries", label: "Inquiries", icon: "inbox", badge: "inquiries" },
      { href: "/admin/crafting", label: "Crafting", icon: "gem", badge: "crafting" },
      { href: "/admin/crafting-prices", label: "Crafting Prices", icon: "tally" },
      { href: "/admin/ai-inbox", label: "AI Inbox", icon: "spark", badge: "aiInbox" },
      { href: "/admin/notes", label: "Notes", icon: "note" },
    ],
  },
  {
    heading: "E-commerce",
    tone: "ecom",
    items: [
      { href: "/admin/products", label: "Products", icon: "tag" },
      { href: "/admin/orders", label: "Orders", icon: "bag", badge: "orders" },
    ],
  },
];

function Icon({ name, className = "h-4 w-4" }: { name: string; className?: string }) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 24 24" className={className}>
      {name === "grid" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" {...common} />
          <rect x="14" y="3" width="7" height="7" rx="1.5" {...common} />
          <rect x="3" y="14" width="7" height="7" rx="1.5" {...common} />
          <rect x="14" y="14" width="7" height="7" rx="1.5" {...common} />
        </>
      )}
      {name === "pipeline" && <path d="M4 6h4v12H4zM10 6h4v8h-4zM16 6h4v5h-4z" {...common} />}
      {name === "inbox" && (
        <>
          <path d="M3 13l2.5-7h13L21 13v5a1 1 0 01-1 1H4a1 1 0 01-1-1z" {...common} />
          <path d="M3 13h5l1 2h6l1-2h5" {...common} />
        </>
      )}
      {name === "note" && (
        <>
          <path d="M6 3h9l5 5v13H6z" {...common} />
          <path d="M15 3v5h5M9 13h6M9 17h4" {...common} />
        </>
      )}
      {/* crafting — a cut stone in profile, the maison's own mark */}
      {name === "gem" && (
        <>
          <path d="M7 4h10l4 5-9 11L3 9z" {...common} />
          <path d="M3 9h18M9.5 9L12 20M14.5 9L12 20M7 4l2.5 5M17 4l-2.5 5" {...common} />
        </>
      )}
      {/* ai inbox — a speech bubble struck through with a spark, so it reads as
          "conversation" first and "machine" second */}
      {name === "spark" && (
        <>
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" {...common} />
          <path d="M12.4 8l.85 2.15L15.4 11l-2.15.85-.85 2.15-.85-2.15L9.4 11l2.15-.85z" {...common} />
        </>
      )}
      {/* crafting prices — stacked discs, the shorthand for a rate card. A tag
          would have read as "a thing for sale" and collided with Products. */}
      {name === "tally" && (
        <>
          <ellipse cx="12" cy="6" rx="7" ry="2.8" {...common} />
          <path d="M5 6v6c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8V6" {...common} />
          <path d="M5 12v6c0 1.55 3.13 2.8 7 2.8s7-1.25 7-2.8v-6" {...common} />
        </>
      )}
      {name === "tag" && (
        <>
          <path d="M4 12.5V5a1 1 0 011-1h7.5L21 12.5 12.5 21z" {...common} />
          <circle cx="8.5" cy="8.5" r="1.4" {...common} />
        </>
      )}
      {name === "bag" && (
        <>
          <path d="M5 8h14l-1 12H6z" {...common} />
          <path d="M9 8V6a3 3 0 016 0v2" {...common} />
        </>
      )}
    </svg>
  );
}

export default function AdminShell({
  email,
  badges,
  children,
}: {
  email: string;
  badges: NavBadges;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-svh bg-[var(--adm-canvas)] lg:flex">
      {/* Sidebar */}
      <aside className="sticky top-0 z-30 flex h-auto shrink-0 flex-col border-b border-[var(--adm-line)] bg-white px-4 py-4 shadow-[1px_0_0_rgba(19,41,75,0.02)] lg:h-svh lg:w-64 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
        <div className="flex items-center justify-between lg:block">
          <Link href="/admin" className="group block">
            <p className="font-serif text-lg font-light tracking-wide text-[var(--adm-ink)] transition-colors group-hover:text-[var(--adm-accent)]">
              Ceylon Gem Maison
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 font-sans text-[0.55rem] uppercase tracking-[0.35em] text-[var(--adm-accent)]">
              <span className="h-1 w-1 rotate-45 bg-[var(--adm-accent)]" />
              Back office
            </p>
          </Link>
        </div>

        {/* On phones every item flows into one horizontal scroller: the sections
            are `contents`, so they generate no box and their headings are
            hidden. From lg they become real panels stacked down the rail. */}
        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-9 lg:flex-col lg:gap-1.5 lg:overflow-x-visible">
          {SECTIONS.map((section, i) => (
            <div
              key={section.heading ?? `section-${i}`}
              className={`contents lg:block ${
                section.tone === "ecom"
                  ? "lg:mt-5 lg:rounded-2xl lg:border lg:border-[var(--adm-line)] lg:bg-[var(--adm-inset)] lg:p-2.5 lg:pt-1"
                  : "lg:mt-4"
              }`}
            >
              {section.heading && (
                <p className="hidden px-3.5 pb-2 pt-3 font-sans text-[0.55rem] uppercase tracking-[0.32em] text-[var(--adm-muted)] lg:block">
                  {section.heading}
                </p>
              )}

              {section.items.map((item) => {
                const active = isActive(item.href, item.exact);
                const count = item.badge ? badges[item.badge] : 0;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`group relative flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 font-sans text-[0.8rem] tracking-wide transition-colors lg:mt-0.5 ${
                      active
                        ? "bg-[var(--adm-accent-tint)] font-medium text-[var(--adm-accent-strong)]"
                        : "text-[var(--adm-ink-soft)] hover:bg-[var(--adm-inset)] hover:text-[var(--adm-ink)]"
                    }`}
                  >
                    {/* A sapphire bar marks the page you are on — quieter than a
                        ring, and it lines the items up down one edge. */}
                    {active && (
                      <span className="absolute left-0 top-1/2 hidden h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-[var(--adm-accent)] lg:block" />
                    )}
                    <Icon
                      name={item.icon}
                      className={`h-4 w-4 ${active ? "text-[var(--adm-accent)]" : "text-[var(--adm-faint)] group-hover:text-[var(--adm-ink-soft)]"}`}
                    />
                    <span>{item.label}</span>
                    {count > 0 && (
                      <span
                        className={`ml-auto hidden rounded-full px-2 py-0.5 font-sans text-[0.6rem] font-semibold lg:inline ${
                          active
                            ? "bg-[var(--adm-accent)] text-white"
                            : "bg-[var(--adm-accent-tint)] text-[var(--adm-accent-strong)]"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="mt-auto hidden border-t border-[var(--adm-line)] pt-5 lg:block">
          <p className="truncate font-body text-[0.72rem] text-[var(--adm-ink-soft)]" title={email}>
            {email}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="mt-2 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[var(--adm-muted)] transition-colors hover:text-[var(--adm-accent)] cursor-pointer"
            >
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 px-5 py-7 md:px-8 lg:px-10 lg:py-9">{children}</main>
    </div>
  );
}
