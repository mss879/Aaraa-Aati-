import AboutUs from "@/components/AboutUs";
import ProductGrid from "@/components/ProductGrid";
import LuxuryShowcase from "@/components/LuxuryShowcase";
import FeaturedProducts from "@/components/FeaturedProducts";
import PremiumServices from "@/components/PremiumServices";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";
import ScrollHero from "@/components/ScrollHero";
import ScrollFX from "@/components/fx/ScrollFX";
import LuxeCursor from "@/components/fx/LuxeCursor";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#070708] p-[10px] select-none flex flex-col">
      {/* GSAP scroll choreography + gold companion cursor (both no-ops for reduced motion) */}
      <ScrollFX />
      <LuxeCursor />

      {/* Scroll-scrubbed cinematic hero: the film's playhead follows scroll,
          and each act's copy fades in exactly when its scene is on screen. */}
      <ScrollHero />

      {/* Scrolling Overlay Content Container - Unified White Flow */}
      <div className="relative z-20 w-full flex flex-col bg-[#FAF9F6] rounded-[2rem] md:rounded-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.35)] border border-zinc-200/80 overflow-hidden">
        {/* About Us section (White Theme) — target of the navbar "Our Story" link */}
        <div id="about" className="scroll-mt-6">
          <AboutUs />
        </div>

        {/* Premium Concierge Services Section */}
        <PremiumServices />

        {/* Product Grid section (Screenshot Layout) — target of the hero "Explore Collection" CTA */}
        <div id="collection" className="scroll-mt-6">
          <ProductGrid />
        </div>

        {/* Editorial Luxury Showcase section */}
        <LuxuryShowcase />

        {/* New 2x2 grid section of Featured Products (Screenshot style, no pricing) */}
        <FeaturedProducts />

        {/* Bespoke Journey CTA Banner — target of the hero "Bespoke Design" CTA */}
        <div id="bespoke" className="scroll-mt-6">
          <CTA />
        </div>

        {/* Brand Luxury Multi-Column Footer */}
        <Footer />
      </div>
    </main>
  );
}
