/** Shown across the admin when Supabase env isn't set yet. Plain server component. */
export default function ConfigNotice() {
  return (
    <div className="mb-8 rounded-2xl border border-[var(--adm-accent)]/40 bg-[var(--adm-accent-tint)] p-5">
      <p className="font-serif text-lg font-light text-[var(--adm-ink)]">Backend not connected yet</p>
      <p className="mt-1.5 font-body text-sm leading-relaxed text-[var(--adm-ink-soft)]">
        Add your Supabase keys to <code className="rounded bg-[var(--adm-accent-tint)] px-1.5 py-0.5 text-[var(--adm-accent-strong)]">.env.local</code>{" "}
        and run the migrations to bring the dashboard online. Full steps are in{" "}
        <code className="rounded bg-[var(--adm-accent-tint)] px-1.5 py-0.5 text-[var(--adm-accent-strong)]">supabase/README.md</code>.
        Everything below will populate automatically once connected.
      </p>
    </div>
  );
}
