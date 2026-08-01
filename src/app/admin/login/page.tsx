"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/**
 * Credentials can be perfectly correct and still not get you in: the server also
 * checks the address against ADMIN_EMAILS. Without this notice that refusal is
 * invisible — the form simply reappears, which reads as a failed password.
 */
function DeniedNotice({ reason }: { reason: string }) {
  const [signedInAs, setSignedInAs] = useState<string | null>(null);
  const forbidden = reason === "forbidden";

  useEffect(() => {
    if (!forbidden || !hasSupabaseEnv) return;
    createSupabaseBrowserClient()
      .auth.getUser()
      .then(({ data }) => setSignedInAs(data.user?.email ?? null));
  }, [forbidden]);

  if (reason === "unconfigured") {
    return (
      <Notice>
        The backend isn’t configured on this deploy — <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> must be set <em>before</em> the build runs.
      </Notice>
    );
  }
  if (!forbidden) return null;

  return (
    <Notice>
      {signedInAs ? <>Signed in as <strong>{signedInAs}</strong>, but that</> : <>That</>} address
      isn’t on the back office allowlist. Add it to <code>ADMIN_EMAILS</code> in the host’s
      environment (server-side, not build-only), then redeploy.
      <button
        type="button"
        onClick={async () => {
          if (hasSupabaseEnv) await createSupabaseBrowserClient().auth.signOut();
          window.location.replace("/admin/login");
        }}
        className="mt-3 block font-sans text-[0.7rem] uppercase tracking-[0.2em] text-[var(--adm-accent)] underline underline-offset-4"
      >
        Sign out
      </button>
    </Notice>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-[var(--adm-line)] bg-[var(--adm-inset)] px-4 py-3 font-body text-[0.8rem] leading-relaxed text-[var(--adm-ink-soft)] [&_code]:font-sans [&_code]:text-[0.75rem] [&_code]:text-[var(--adm-ink)]"
    >
      {children}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "/admin";
  const reason = params.get("reason") ?? "";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    if (!hasSupabaseEnv) {
      setError("The backend is not configured yet. Add your Supabase keys to .env.local.");
      return;
    }
    setBusy(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) {
      setError(err.message || "Sign-in failed.");
      setBusy(false);
      return;
    }
    router.replace(nextPath.startsWith("/admin") ? nextPath : "/admin");
    router.refresh();
  };

  const field = "adm-field mt-2 py-3";

  return (
    <div className="flex min-h-svh items-center justify-center px-6 py-16">
      {/* One card, centred, on the canvas — the whole back office in miniature. */}
      <form onSubmit={submit} className="adm-card w-full max-w-sm p-8 md:p-10">
        <Link href="/" className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-[var(--adm-accent)]">
          Ceylon Gem Maison
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-light tracking-wide text-[var(--adm-ink)]">
          Maison Admin
        </h1>
        <p className="mt-2 mb-8 font-body text-sm text-[var(--adm-ink-soft)]">
          Sign in to your back office.
        </p>

        <DeniedNotice reason={reason} />

        <div className="space-y-5">
          <div>
            <label htmlFor="email" className="adm-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="password" className="adm-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={busy}
          className="adm-btn mt-8 w-full py-3.5"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        {error && (
          <p className="mt-5 font-body text-[0.8rem] text-[var(--adm-danger)]" role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-svh" />}>
      <LoginForm />
    </Suspense>
  );
}
