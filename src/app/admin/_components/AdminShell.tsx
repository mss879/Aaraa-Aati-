"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/admin/_actions";

const NAV = [
  { href: "/admin", label: "Dashboard", exact: true, icon: "grid" },
  { href: "/admin/crm", label: "CRM Pipeline", icon: "pipeline" },
  { href: "/admin/inquiries", label: "Inquiries", icon: "inbox" },
  { href: "/admin/notes", label: "Notes", icon: "note" },
] as const;

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
      {name === "pipeline" && (
        <>
          <path d="M4 6h4v12H4zM10 6h4v8h-4zM16 6h4v5h-4z" {...common} />
        </>
      )}
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
    </svg>
  );
}

export default function AdminShell({
  email,
  newInquiries,
  children,
}: {
  email: string;
  newInquiries: number;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-svh bg-[#070f1c] lg:flex">
      {/* Sidebar */}
      <aside className="sticky top-0 z-30 flex h-auto shrink-0 flex-col border-b border-[#16263f] bg-[#0a1526] px-4 py-4 lg:h-svh lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
        <div className="flex items-center justify-between lg:block">
          <Link href="/admin" className="block">
            <p className="font-serif text-lg font-light tracking-wide text-gold-100">
              Ceylon Gem Maison
            </p>
            <p className="font-sans text-[0.55rem] uppercase tracking-[0.35em] text-gold-400">
              Back office
            </p>
          </Link>
        </div>

        <nav className="mt-4 flex gap-1 overflow-x-auto lg:mt-9 lg:flex-col lg:gap-1.5 lg:overflow-visible">
          {NAV.map((item) => {
            const active = isActive(item.href, "exact" in item ? item.exact : false);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 font-sans text-[0.8rem] tracking-wide transition-colors ${
                  active
                    ? "bg-gold-500/15 text-gold-100 ring-1 ring-inset ring-gold-400/30"
                    : "text-[#8595ad] hover:bg-white/[0.04] hover:text-gold-100"
                }`}
              >
                <Icon name={item.icon} />
                <span>{item.label}</span>
                {item.href === "/admin/inquiries" && newInquiries > 0 && (
                  <span className="ml-auto hidden rounded-full bg-gold-400 px-2 py-0.5 font-sans text-[0.6rem] font-semibold text-white lg:inline">
                    {newInquiries}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto hidden border-t border-[#16263f] pt-5 lg:block">
          <p className="truncate font-body text-[0.72rem] text-[#8595ad]" title={email}>
            {email}
          </p>
          <form action={signOut}>
            <button
              type="submit"
              className="mt-2 font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[#6f8199] transition-colors hover:text-gold-200 cursor-pointer"
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
