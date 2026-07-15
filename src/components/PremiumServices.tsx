import React from "react";

export default function PremiumServices() {
  const services = [
    {
      number: "01",
      title: "On-Call Atelier Visits",
      highlight: "Concierge Private Access",
      description: "Experience the luxury of our boutique from the comfort of your home, office, or private suite. Our master gemologist will bring curated jewelry collections directly to you for private viewings, custom fittings, and bespoke styling sessions.",
      icon: (
        <svg className="w-6 h-6 text-gold-300 transition-transform duration-500 group-hover:rotate-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    },
    {
      number: "02",
      title: "Last-Minute Private Buys",
      highlight: "Express Armored Delivery",
      description: "For immediate occasions, bypass standard ordering. Access our VIP priority acquisitions hotline for immediate diamond selection, expedited design processing, and secure armored hand-courier delivery within 24 hours.",
      icon: (
        <svg className="w-6 h-6 text-gold-300 transition-transform duration-500 group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      number: "03",
      title: "Vault Consultation & VIP Lounge",
      highlight: "By Private Appointment Only",
      description: "Schedule a secure, private consultation inside our atelier's private vaults. Gain exclusive access to unmounted raw diamonds, reserve investment-grade precious gemstones, and view historically significant heritage archive designs.",
      icon: (
        <svg className="w-6 h-6 text-gold-300 transition-transform duration-500 group-hover:-translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  return (
    <section className="relative w-full bg-[#0b0b0c] py-32 md:py-44 px-6 md:px-12 z-20 select-none border-t border-zinc-900">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-gold-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gold-300/5 blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div data-reveal className="max-w-2xl mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-gold-400/20 bg-gold-400/5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-gold-300 animate-pulse" />
            <span className="text-[0.7rem] tracking-[0.3em] uppercase text-gold-200 font-sans font-medium">
              Exclusive Concierge
            </span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-normal leading-[1.15] tracking-wide text-white font-serif mb-6">
            Services Crafted <br />
            <span className="italic text-gold-300 font-serif font-light">for the Connoisseur</span>
          </h2>
          
          <p className="text-sm md:text-base text-zinc-300 font-sans leading-relaxed">
            To ensure your acquisitions match the significance of your milestones, Ceylon Gem Maison offers bespoke private assistance that fits seamlessly around your lifestyle.
          </p>
        </div>

        {/* 3-Column Services Cards Grid */}
        <div data-reveal-group className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="group relative bg-[#0e0e10]/40 backdrop-blur-md border border-zinc-900/80 hover:border-gold-400/20 p-8 rounded-2xl flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 shadow-[0_10px_35px_rgba(0,0,0,0.5)] hover:shadow-[0_20px_45px_rgba(0,0,0,0.7)] overflow-hidden"
            >
              {/* Expanding Top Gold Border */}
              <div className="absolute top-0 left-0 w-0 h-[2px] bg-gradient-to-r from-gold-300 to-gold-500 transition-all duration-500 group-hover:w-full" />
              
              {/* Subtle Radial Glow */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(218,174,102,0.03),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Number Indicator */}
              <span className="absolute top-6 right-8 text-5xl md:text-6xl font-serif font-light text-zinc-900/60 transition-colors duration-500 group-hover:text-gold-500/10 pointer-events-none select-none">
                {service.number}
              </span>

              <div className="space-y-6 relative z-10">
                {/* Icon Wrapper with glow effect */}
                <div className="w-14 h-14 rounded-xl bg-gold-500/5 border border-gold-500/10 flex items-center justify-center transition-all duration-300 group-hover:bg-gold-500/10 group-hover:border-gold-400/30 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.08)]">
                  {service.icon}
                </div>

                <div className="space-y-2.5">
                  {/* Service Highlight Tag */}
                  <span className="text-[0.68rem] tracking-[0.2em] uppercase text-gold-400 font-sans font-medium block">
                    {service.highlight}
                  </span>
                  
                  {/* Service Title */}
                  <h3 className="text-xl md:text-2xl font-normal text-white font-serif tracking-wide group-hover:text-gold-200 transition-colors">
                    {service.title}
                  </h3>
                </div>

                {/* Service Description */}
                <p className="text-[0.85rem] md:text-sm text-zinc-300 font-sans leading-relaxed max-w-sm">
                  {service.description}
                </p>
              </div>

              {/* Action Link inside Card */}
              <div className="pt-8 border-t border-zinc-900/60 mt-8 flex items-center gap-2 text-gold-300 group-hover:text-white transition-colors cursor-pointer self-start relative z-10">
                <span className="text-[0.7rem] md:text-[0.72rem] tracking-[0.25em] uppercase font-sans font-semibold">
                  Inquire Now
                </span>
                <svg className="w-3.5 h-3.5 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
        
      </div>
    </section>
  );
}
