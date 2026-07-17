import type { Metadata } from "next";
import AtelierConfigurator from "@/components/atelier/AtelierConfigurator";

export const metadata: Metadata = {
  title: "Bespoke Atelier — Design Your Ring, Necklace or Bracelet",
  description:
    "Compose your own ring, necklace or bracelet: choose the piece, setting, precious metal, gemstone, cut and carat in a live 3D atelier — then let AI render your finished commission.",
  alternates: { canonical: "/atelier" },
};

export default function AtelierPage() {
  return (
    <main className="min-h-svh w-full bg-[#0A1F3D]">
      <AtelierConfigurator />
    </main>
  );
}
