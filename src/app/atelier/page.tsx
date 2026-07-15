import type { Metadata } from "next";
import AtelierConfigurator from "@/components/atelier/AtelierConfigurator";

export const metadata: Metadata = {
  title: "Bespoke Atelier — Design Your Ring",
  description:
    "Compose your own engagement ring: choose the setting, precious metal, gemstone, cut and carat in a live 3D atelier — then let AI render your finished commission.",
};

export default function AtelierPage() {
  return (
    <main className="min-h-svh w-full bg-[#070708]">
      <AtelierConfigurator />
    </main>
  );
}
