import Link from "next/link";
import { getDashboardStats, getNotes, getRecentGenerations } from "@/lib/admin/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LEAD_STAGES, configSummary, formatPrice } from "@/lib/leads";
import NotesBoard from "@/app/admin/_components/NotesBoard";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  hint,
  href,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  href?: string;
  /** "ecom" tiles carry the sapphire rule, matching the sidebar's shop panel. */
  tone?: "ecom";
}) {
  const body = (
    <>
      <p className="adm-label">{label}</p>
      <p className="mt-2.5 font-serif text-3xl font-light text-[var(--adm-ink)]">{value}</p>
      {hint && <p className="mt-1 font-body text-[0.72rem] text-[var(--adm-muted)]">{hint}</p>}
    </>
  );
  // A hairline of sapphire along the top separates the shop's numbers from the
  // maison's without needing a second surface colour.
  const className = `adm-card relative overflow-hidden p-5 ${
    tone === "ecom" ? "before:absolute before:inset-x-0 before:top-0 before:h-[3px] before:bg-[var(--adm-accent)]" : ""
  } ${href ? "adm-card-link" : ""}`;

  return href ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <div className={className}>{body}</div>
  );
}

export default async function DashboardPage() {
  const [stats, generations, notes] = await Promise.all([
    getDashboardStats(),
    getRecentGenerations(6),
    getNotes(),
  ]);
  const pipelineMax = Math.max(1, ...LEAD_STAGES.map((s) => stats.stageCounts[s.id]));

  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">Dashboard</h1>
        <p className="mt-1.5 font-body text-sm text-[var(--adm-ink-soft)]">
          Everything happening across the Maison, at a glance.
        </p>
      </header>

      {!hasSupabaseEnv && <ConfigNotice />}

      {/* Maison tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Active leads"
          value={String(stats.totalLeads)}
          hint="in the pipeline"
          href="/admin/crm"
        />
        <StatCard
          label="New inquiries"
          value={String(stats.newInquiries)}
          hint="awaiting triage"
          href="/admin/inquiries"
        />
        <StatCard
          label="New commissions"
          value={String(stats.newCraftRequests)}
          hint="from the atelier"
          href="/admin/crafting"
        />
        <StatCard label="Won value" value={formatPrice(stats.wonValue)} hint="est. from configs" />
      </div>

      {/* E-commerce tiles — the shop's own half of the business */}
      <div className="mt-8">
        <p className="mb-3 font-sans text-[0.58rem] uppercase tracking-[0.32em] text-[var(--adm-muted)]">
          E-commerce
        </p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Live products"
            value={String(stats.liveProducts)}
            hint="in the shop"
            href="/admin/products"
            tone="ecom"
          />
          <StatCard
            label="Pending orders"
            value={String(stats.pendingOrders)}
            hint="awaiting confirmation"
            href="/admin/orders"
            tone="ecom"
          />
          <StatCard
            label="Orders booked"
            value={formatPrice(stats.orderValue)}
            hint="excl. cancelled"
            href="/admin/orders"
            tone="ecom"
          />
          <StatCard
            label="AI renders"
            value={String(stats.totalGenerations)}
            hint="all time"
          />
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Pipeline overview */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-light text-[var(--adm-ink)]">Pipeline</h2>
            <Link href="/admin/crm" className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[var(--adm-accent)] transition-colors hover:text-[var(--adm-accent-strong)]">
              Open board →
            </Link>
          </div>
          <div className="adm-card space-y-3 p-5">
            {LEAD_STAGES.map((s) => {
              const count = stats.stageCounts[s.id];
              return (
                <div key={s.id} className="flex items-center gap-4">
                  <span className="w-20 shrink-0 font-sans text-[0.68rem] uppercase tracking-[0.14em] text-[var(--adm-ink-soft)]">
                    {s.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[var(--adm-inset)]">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${(count / pipelineMax) * 100}%`, backgroundColor: s.accent }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right font-serif text-sm text-[var(--adm-ink)]">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Recent renders */}
          <div className="mb-4 mt-8 flex items-center justify-between">
            <h2 className="font-serif text-xl font-light text-[var(--adm-ink)]">Recent AI renders</h2>
          </div>
          {generations.length === 0 ? (
            <p className="adm-empty p-8 text-center font-body text-sm text-[var(--adm-muted)]">
              No renders yet — they appear here as visitors design in the atelier.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {generations.map((g) => (
                <div key={g.id} className="adm-card overflow-hidden">
                  <div className="aspect-square bg-[var(--adm-inset)]">
                    {g.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- signed private URL
                      <img src={g.imageUrl} alt="AI render" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[var(--adm-ink-soft)]">
                        {g.status === "failed" ? "failed" : "no image"}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate font-body text-[0.72rem] text-[var(--adm-ink)]">
                      {g.lead?.name ?? "Anonymous"}
                    </p>
                    <p className="mt-0.5 truncate font-body text-[0.62rem] text-[var(--adm-muted)]">
                      {configSummary(g.config)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Notes widget */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-light text-[var(--adm-ink)]">Notes</h2>
            <Link href="/admin/notes" className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-[var(--adm-accent)] transition-colors hover:text-[var(--adm-accent-strong)]">
              All notes →
            </Link>
          </div>
          <NotesBoard notes={notes.slice(0, 4)} compact />
        </section>
      </div>
    </div>
  );
}
