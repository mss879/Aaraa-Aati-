import { getNotes } from "@/lib/admin/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import NotesBoard from "@/app/admin/_components/NotesBoard";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

export default async function NotesPage() {
  const notes = await getNotes();
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">Notes</h1>
        <p className="mt-1.5 font-body text-sm text-[var(--adm-ink-soft)]">
          A private scratchpad for the atelier — reminders, follow-ups, stones to source.
        </p>
      </header>
      {!hasSupabaseEnv && <ConfigNotice />}
      <NotesBoard notes={notes} />
    </div>
  );
}
