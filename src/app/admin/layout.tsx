import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maison Admin",
  robots: { index: false, follow: false },
};

// Pass-through wrapper. The gated shell + auth live in admin/(app)/layout.tsx;
// admin/login sits outside the gate.
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-[#081221] text-gold-50">{children}</div>;
}
