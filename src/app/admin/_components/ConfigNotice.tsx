/** Shown across the admin when Supabase env isn't set yet. Plain server component. */
export default function ConfigNotice() {
  return (
    <div className="mb-8 rounded-2xl border border-gold-400/30 bg-gold-500/10 p-5">
      <p className="font-serif text-lg font-light text-gold-100">Backend not connected yet</p>
      <p className="mt-1.5 font-body text-sm leading-relaxed text-[#a9b8d0]">
        Add your Supabase keys to <code className="rounded bg-black/30 px-1.5 py-0.5 text-gold-200">.env.local</code>{" "}
        and run the migrations to bring the dashboard online. Full steps are in{" "}
        <code className="rounded bg-black/30 px-1.5 py-0.5 text-gold-200">supabase/README.md</code>.
        Everything below will populate automatically once connected.
      </p>
    </div>
  );
}
