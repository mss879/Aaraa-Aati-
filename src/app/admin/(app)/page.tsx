import Link from "next/link";
import { getDashboardStats, getNotes, getRecentGenerations } from "@/lib/admin/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { LEAD_STAGES, configSummary, formatPrice } from "@/lib/leads";
import NotesBoard from "@/app/admin/_components/NotesBoard";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-[#16263f] bg-[#0a1526] p-5">
      <p className="font-sans text-[0.6rem] uppercase tracking-[0.25em] text-[#6f8199]">{label}</p>
      <p className="mt-2 font-serif text-3xl font-light text-gold-100">{value}</p>
      {hint && <p className="mt-1 font-body text-[0.7rem] text-[#6f8199]">{hint}</p>}
    </div>
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
        <h1 className="font-serif text-3xl font-light tracking-wide text-gold-50">Dashboard</h1>
        <p className="mt-1.5 font-body text-sm text-[#8595ad]">
          Everything happening across the Maison, at a glance.
        </p>
      </header>

      {!hasSupabaseEnv && <ConfigNotice />}

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active leads" value={String(stats.totalLeads)} hint="in the pipeline" />
        <StatCard label="New inquiries" value={String(stats.newInquiries)} hint="awaiting triage" />
        <StatCard label="AI renders" value={String(stats.totalGenerations)} hint="all time" />
        <StatCard label="Won value" value={formatPrice(stats.wonValue)} hint="est. from configs" />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Pipeline overview */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-light text-gold-100">Pipeline</h2>
            <Link href="/admin/crm" className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-gold-400 hover:text-gold-200">
              Open board →
            </Link>
          </div>
          <div className="space-y-3 rounded-2xl border border-[#16263f] bg-[#0a1526] p-5">
            {LEAD_STAGES.map((s) => {
              const count = stats.stageCounts[s.id];
              return (
                <div key={s.id} className="flex items-center gap-4">
                  <span className="w-20 shrink-0 font-sans text-[0.68rem] uppercase tracking-[0.14em] text-[#8595ad]">
                    {s.label}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full transition-[width] duration-500"
                      style={{ width: `${(count / pipelineMax) * 100}%`, backgroundColor: s.accent }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right font-serif text-sm text-gold-100">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Recent renders */}
          <div className="mb-4 mt-8 flex items-center justify-between">
            <h2 className="font-serif text-xl font-light text-gold-100">Recent AI renders</h2>
          </div>
          {generations.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[#1d3050] bg-[#0a1526]/50 p-8 text-center font-body text-sm text-[#6f8199]">
              No renders yet — they appear here as visitors design in the atelier.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {generations.map((g) => (
                <div key={g.id} className="overflow-hidden rounded-2xl border border-[#16263f] bg-[#0a1526]">
                  <div className="aspect-square bg-white">
                    {g.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- signed private URL
                      <img src={g.imageUrl} alt="AI render" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center font-sans text-[0.6rem] uppercase tracking-[0.2em] text-[#8595ad]">
                        {g.status === "failed" ? "failed" : "no image"}
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="truncate font-body text-[0.72rem] text-gold-100">
                      {g.lead?.name ?? "Anonymous"}
                    </p>
                    <p className="mt-0.5 truncate font-body text-[0.62rem] text-[#6f8199]">
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
            <h2 className="font-serif text-xl font-light text-gold-100">Notes</h2>
            <Link href="/admin/notes" className="font-sans text-[0.62rem] uppercase tracking-[0.2em] text-gold-400 hover:text-gold-200">
              All notes →
            </Link>
          </div>
          <NotesBoard notes={notes.slice(0, 4)} compact />
        </section>
      </div>
    </div>
  );
}
