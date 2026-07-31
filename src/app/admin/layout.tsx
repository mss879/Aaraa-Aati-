import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maison Admin",
  robots: { index: false, follow: false },
};

/**
 * Pass-through wrapper — and the one place the back office's light theme is
 * switched on. `.admin-theme` (see globals.css) declares the --adm-* tokens
 * every screen below reads, so the marketing pages keep their cream-and-navy
 * palette untouched. The gated shell + auth live in admin/(app)/layout.tsx;
 * admin/login sits outside the gate but inside this theme.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-theme min-h-svh">{children}</div>;
}
