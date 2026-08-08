import { getAiConversations } from "@/lib/admin/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import AiInboxView from "@/app/admin/_components/AiInboxView";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

export default async function AiInboxPage() {
  const conversations = await getAiConversations();
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">
          AI Inbox
        </h1>
        <p className="mt-1.5 font-body text-sm text-[var(--adm-ink-soft)]">
          Every conversation the concierge has held. Threads marked “In CRM” already have a card in
          the pipeline — she opened it herself when the visitor gave their details.
        </p>
      </header>
      {!hasSupabaseEnv && <ConfigNotice />}
      <AiInboxView conversations={conversations} />
    </div>
  );
}
