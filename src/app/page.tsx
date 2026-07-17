import type { Metadata } from "next";
import AboutUs from "@/components/AboutUs";
import ProductGrid from "@/components/ProductGrid";
import ServicesPreview from "@/components/ServicesPreview";
import OurWork from "@/components/OurWork";
import FAQ from "@/components/FAQ";
import ArticlesPreview from "@/components/ArticlesPreview";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollHero from "@/components/ScrollHero";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";
import { FAQ_ITEMS } from "@/lib/faq";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  // FAQPage structured data, generated from the same source as the visible FAQ.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <main className="relative min-h-screen w-full bg-[#F7F4EC] select-none flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* GSAP scroll choreography + gold companion cursor (both no-ops for reduced motion) */}
      <ScrollFX />
      <LuxeCursor />

      {/* Scroll-scrubbed cinematic hero: the film's playhead follows scroll,
          and each act's copy fades in exactly when its scene is on screen. */}
      <ScrollHero />

      {/* Scrolling Overlay Content Container - Unified White Flow */}
      <div className="relative z-20 w-full flex flex-col bg-[#F7F4EC]">
        {/* About preview — one paragraph and a button into /about */}
        <div id="about" className="scroll-mt-6">
          <AboutUs />
        </div>

        {/* Services preview — names only, linking into /services */}
        <ServicesPreview />

        {/* Collection preview — target of the hero "Explore Collection" CTA */}
        <div id="collection" className="scroll-mt-6">
          <ProductGrid />
        </div>

        {/* Our Work — two counter-drifting strips of real commissions */}
        <OurWork />

        {/* Bespoke Journey CTA Banner — target of the hero "Bespoke Design" CTA */}
        <div id="bespoke" className="scroll-mt-6">
          <CTA />
        </div>

        {/* FAQ — Singapore clients' most common questions */}
        <FAQ />

        {/* Journal preview — directly after the FAQ */}
        <ArticlesPreview />

        {/* Brand Luxury Multi-Column Footer */}
        <Footer />
      </div>
    </main>
  );
}
