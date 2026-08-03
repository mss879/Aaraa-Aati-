import type { Metadata } from "next";
import AtelierConfigurator from "@/components/atelier/AtelierConfigurator";
import { SITE_URL, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Bespoke Atelier — Design Your Ring, Necklace or Bracelet",
  description:
    "Compose your own ring, necklace or bracelet: choose the piece, setting, precious metal, gemstone, cut and carat in a live 3D atelier — then let AI render your finished commission.",
  path: "/atelier",
  keywords: [
    "design your own engagement ring Singapore",
    "custom sapphire ring builder",
    "3D ring configurator",
    "bespoke jewellery Singapore",
  ],
});

/**
 * The configurator is a client component that holds a blank navy field until
 * hydration decides whether to show the lead gate or the studio — which meant
 * this route served a document with no heading and no words in it at all, while
 * sitting near the top of the sitemap.
 *
 * The block below is the page's server-rendered substance: a real <h1> and a
 * plain-language description of what the tool does. It is visually hidden
 * (`sr-only`), so the navy stage is pixel-for-pixel what it was — but crawlers
 * that don't execute JS, and screen readers arriving before hydration, now get
 * an accurate account of the page instead of an empty div.
 */
export default function AtelierPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumbJsonLd([{ name: "Bespoke Atelier", path: "/atelier" }]),
      {
        "@type": "WebApplication",
        "@id": `${SITE_URL}/atelier#app`,
        name: "Ceylon Gem Maison Bespoke Atelier",
        url: `${SITE_URL}/atelier`,
        applicationCategory: "DesignApplication",
        operatingSystem: "Any modern web browser",
        browserRequirements: "Requires JavaScript and WebGL",
        description:
          "A live 3D configurator for composing a bespoke ring, necklace or bracelet — choose the setting, precious metal, Ceylon gemstone, cut and carat, and receive an instant indicative quotation.",
        publisher: { "@id": `${SITE_URL}/#organization` },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "SGD",
          description: "Free to use; quotations are indicative until confirmed by the concierge.",
        },
      },
    ],
  };

  return (
    <main className="min-h-svh w-full bg-[#0A1F3D] pt-[var(--nav-h)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="sr-only">
        <h1>Bespoke Atelier — Design Your Own Ceylon Sapphire Ring, Necklace or Bracelet</h1>
        <p>
          The Ceylon Gem Maison atelier is a live 3D design studio. Choose your piece — a
          ring, a necklace or a bracelet — then compose it stone by stone: the setting, the
          precious metal, the Ceylon gemstone, its cut and its carat weight. The jewel turns
          in front of you as you decide, and an indicative quotation updates with every
          choice, so you can balance design against budget before you speak to anyone.
        </p>
        <p>
          Every stone is bought at source from licensed Sri Lankan mines with full
          chain-of-custody papers, hand-cut in the house workshop, and delivered insured to
          Singapore and worldwide. When your composition is settled, our concierge confirms
          the final quotation, the certified stone grade and the four-to-six week commission
          schedule.
        </p>
      </div>

      <AtelierConfigurator />
    </main>
  );
}
