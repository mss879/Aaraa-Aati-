"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function LoginForm() {
  const router = useRouter();
  const nextPath = useSearchParams().get("next") || "/admin";
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

  const field =
    "mt-2 w-full rounded-xl border border-[#27497A] bg-[#0d1b30] px-4 py-3 font-body text-sm text-gold-50 placeholder-[#4A6285] outline-none transition-colors focus:border-gold-400";

  return (
    <div className="flex min-h-svh items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm">
        <Link href="/" className="font-sans text-[0.6rem] uppercase tracking-[0.35em] text-gold-400">
          Ceylon Gem Maison
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-light tracking-wide text-gold-50">
          Maison Admin
        </h1>
        <p className="mt-2 font-body text-sm text-[#8ea1c0]">Sign in to your back office.</p>

        <div className="mt-8 space-y-5">
          <div>
            <label htmlFor="email" className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-[#8ea1c0]">
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
            <label htmlFor="password" className="font-sans text-[0.6rem] uppercase tracking-[0.28em] text-[#8ea1c0]">
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
          className="mt-8 w-full rounded-full bg-gold-400 px-8 py-3.5 font-sans text-xs font-semibold uppercase tracking-[0.25em] text-white transition-colors hover:bg-gold-300 disabled:opacity-60 cursor-pointer"
        >
          {busy ? "Signing in…" : "Sign in"}
        </button>

        {error && (
          <p className="mt-5 font-body text-[0.8rem] text-rose-300" role="alert">
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
