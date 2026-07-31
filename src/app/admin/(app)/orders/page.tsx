import { getOrders } from "@/lib/admin/data";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { hasResend } from "@/lib/email/resend";
import OrdersView from "@/app/admin/_components/OrdersView";
import ConfigNotice from "@/app/admin/_components/ConfigNotice";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await getOrders();
  return (
    <div className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">Orders</h1>
        <p className="mt-1.5 font-body text-sm text-[var(--adm-ink-soft)]">
          Every order placed through the shop. Setting a status emails the customer — the two
          shipping steps ask for the courier and tracking number first.
        </p>
      </header>
      {!hasSupabaseEnv && <ConfigNotice />}
      {hasSupabaseEnv && !hasResend && (
        <div className="mb-8 rounded-2xl border border-[var(--adm-accent)]/40 bg-[var(--adm-accent-tint)] p-5">
          <p className="font-serif text-lg font-light text-[var(--adm-ink)]">Order email is switched off</p>
          <p className="mt-1.5 font-body text-sm leading-relaxed text-[var(--adm-ink-soft)]">
            Add{" "}
            <code className="rounded bg-[var(--adm-accent-tint)] px-1.5 py-0.5 text-[var(--adm-accent-strong)]">RESEND_API_KEY</code>{" "}
            (and a verified{" "}
            <code className="rounded bg-[var(--adm-accent-tint)] px-1.5 py-0.5 text-[var(--adm-accent-strong)]">RESEND_FROM</code>{" "}
            sender) to <code className="rounded bg-[var(--adm-accent-tint)] px-1.5 py-0.5 text-[var(--adm-accent-strong)]">.env.local</code>{" "}
            and restart. Orders still work — customers simply aren&apos;t written to.
          </p>
        </div>
      )}
      <OrdersView orders={orders} emailConfigured={hasResend} />
    </div>
  );
}
