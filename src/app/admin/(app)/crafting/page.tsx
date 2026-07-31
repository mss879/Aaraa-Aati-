import { getCraftRequests } from "@/lib/admin/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import CraftingView from "@/app/admin/_components/CraftingView";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

export default async function CraftingPage() {
  const requests = await getCraftRequests();
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">Crafting</h1>
        <p className="mt-1.5 font-body text-sm text-[var(--adm-ink-soft)]">
          Bespoke commissions opened in the atelier — their design, their renders, their estimate.
          Send the serious ones to the CRM.
        </p>
      </header>
      {!hasSupabaseEnv && <ConfigNotice />}
      <CraftingView requests={requests} />
    </div>
  );
}
