import Navbar from "@/components/Navbar";
import AboutUs from "@/components/AboutUs";
import ProductGrid from "@/components/ProductGrid";
import LuxuryShowcase from "@/components/LuxuryShowcase";
import FeaturedProducts from "@/components/FeaturedProducts";
import PremiumServices from "@/components/PremiumServices";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-[#070708] p-[10px] select-none flex flex-col">
      {/* Hero container with rounded edges - Sticky to enable parallax overlap scroll */}
      <div className="sticky top-[10px] z-10 w-full h-[calc(100vh-20px)] rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-gold-500/10 shadow-[0_0_80px_rgba(0,0,0,0.85)] flex flex-col justify-between flex-shrink-0">
        
        {/* Background Image Container */}
        <div 
          className="absolute inset-0 bg-[url('/jewelty%20design.png')] bg-cover bg-center transition-transform duration-[12000ms] hover:scale-105"
          style={{ transformOrigin: "center" }}
        />
        
        {/* Dark Elegant Gradient Overlays for Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/35 to-black/90 z-10" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(0,0,0,0.8)_100%)] z-10" />

        {/* Header Overlay */}
        <Navbar />

        {/* Content Wrapper */}
        <div className="relative z-20 flex-1 flex flex-col justify-end px-6 pb-12 md:px-16 md:pb-20 max-w-2xl">
          <div className="space-y-6">
            
            {/* Main Headline */}
            <h1 className="text-4xl md:text-6xl font-normal leading-[1.1] tracking-wide text-gold-100 font-serif">
              Crafted with <br />
              <span className="italic text-gold-300 font-serif font-light">Timeless Passion</span>
            </h1>

            {/* Subtext */}
            <p className="text-sm md:text-base text-gold-100/70 font-sans font-light leading-relaxed max-w-lg tracking-wide">
              Enter a world of unmatched design. Discover exquisite diamonds, signature precious gemstones, and bespoke custom jewelry made to tell your story.
            </p>

            {/* Call To Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <a
                href="#"
                className="px-8 py-3.5 rounded-full bg-gold-400 text-obsidian-950 text-xs tracking-[0.2em] font-sans font-medium uppercase transition-all duration-300 hover:bg-gold-300 text-center shadow-[0_4px_20px_rgba(212,175,55,0.25)] hover:shadow-[0_4px_30px_rgba(212,175,55,0.45)] hover:-translate-y-0.5 active:translate-y-0"
              >
                Explore Collection
              </a>
              <a
                href="#"
                className="px-8 py-3.5 rounded-full border border-gold-400/30 text-gold-200 text-xs tracking-[0.2em] font-sans font-medium uppercase hover:bg-gold-500/10 hover:border-gold-300/60 transition-all duration-300 text-center backdrop-blur-sm hover:-translate-y-0.5 active:translate-y-0"
              >
                Bespoke Design
              </a>
            </div>
            
          </div>
        </div>

        {/* Ambient Subtle Footer details on the Hero container itself */}
        <div className="relative z-20 w-full flex items-center justify-between px-6 pb-6 md:px-16 text-[0.6rem] md:text-[0.7rem] tracking-[0.25em] text-gold-100/35 uppercase font-sans border-t border-gold-500/5 pt-4">
          <div>Est. 1928 / Sri Lanka</div>
          <div className="hidden sm:block">Ethically Sourced Diamonds Only</div>
          <div>Bespoke Atelier</div>
        </div>

      </div>

      {/* Scrolling Overlay Content Container - Unified White Flow */}
      <div className="relative z-20 w-full flex flex-col bg-[#FAF9F6] rounded-[2rem] md:rounded-[3rem] shadow-[0_-20px_50px_rgba(0,0,0,0.35)] border border-zinc-200/80 overflow-hidden">
        {/* About Us section (White Theme) */}
        <AboutUs />

        {/* Premium Concierge Services Section */}
        <PremiumServices />

        {/* Product Grid section (Screenshot Layout) */}
        <ProductGrid />

        {/* Editorial Luxury Showcase section */}
        <LuxuryShowcase />

        {/* New 2x2 grid section of Featured Products (Screenshot style, no pricing) */}
        <FeaturedProducts />

        {/* Bespoke Journey CTA Banner */}
        <CTA />

        {/* Brand Luxury Multi-Column Footer */}
        <Footer />
      </div>
    </main>
  );
}
