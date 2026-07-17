import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing use of the Ceylon Gem Maison website, digital atelier quotations, bespoke commissions and deliveries.",
  alternates: { canonical: "/terms" },
  robots: { index: false },
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "About These Terms",
    body: [
      "These terms govern your use of ceylongemmaison.com and the purchase of jewellery and services from Ceylon Gem Maison. By using the site or placing a commission, you agree to them. If any provision is found unenforceable, the remainder continues in effect.",
    ],
  },
  {
    heading: "Quotations & the Digital Atelier",
    body: [
      "Quotations produced by the digital atelier are indicative estimates generated from your chosen specifications. They help you balance design and budget but do not constitute a binding offer. A final, binding quotation is confirmed by our concierge after stone selection, and may vary with gemstone availability, certified stone grades, metal market prices and design refinements.",
    ],
  },
  {
    heading: "Bespoke Commissions",
    body: [
      "Bespoke pieces are made to order to your approved design. A deposit confirms the commission; the balance is due before delivery. Because each piece is made for you, bespoke commissions are not returnable except where a piece is defective or does not match the approved design. We will always work with you until the piece is right.",
    ],
  },
  {
    heading: "Certification & Product Representations",
    body: [
      "Gemstone weights, dimensions and grades are stated per the accompanying independent laboratory certificate. Minor variations natural to handcrafted jewellery — and colour differences arising from screens — are not defects. All images on this site are of our own work or representative renders of configurable designs.",
    ],
  },
  {
    heading: "Delivery & Risk",
    body: [
      "Deliveries are made by fully insured, trackable courier with signature on receipt. Risk passes to you on signed delivery. Import taxes or duties, where applicable in your jurisdiction, are the recipient's responsibility unless expressly stated otherwise in your quotation.",
    ],
  },
  {
    heading: "Lifetime Warranty",
    body: [
      "Every piece is warranted for the lifetime of the original owner against defects in structure and gem setting under normal wear. The warranty does not cover loss, theft, accidental damage, or work performed by third-party jewellers. Warranty service is arranged through our insured courier partners.",
    ],
  },
  {
    heading: "Intellectual Property",
    body: [
      "All content on this site — designs, photography, films, text and the Ceylon Gem Maison name and marks — is the property of Ceylon Gem Maison or its licensors and may not be reproduced without written permission.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "Questions about these terms may be sent to support@ceylongemmaison.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="relative flex min-h-screen w-full select-none flex-col bg-[#F7F4EC]">
      {/* Compact dark header */}
      <section className="relative z-10 w-full">
        <div className="relative flex min-h-[42svh] w-full flex-col overflow-hidden bg-[#0A1F3D]">
          <div className="pointer-events-none absolute -bottom-24 left-1/2 h-[320px] w-[520px] -translate-x-1/2 rounded-full bg-gold-400/10 blur-[130px]" />
          <div className="relative z-40">
            <Navbar />
          </div>
          <div className="relative z-30 flex flex-1 items-end px-6 pb-12 pt-40 md:px-16 md:pb-16">
            <div>
              <p className="mb-4 font-sans text-[0.72rem] font-medium uppercase tracking-[0.42em] text-gold-300">
                The Fine Print
              </p>
              <h1 className="font-serif text-4xl font-light leading-[1.05] tracking-wide text-gold-50 md:text-5xl">
                Terms of <span className="italic text-gold-200">Service</span>
              </h1>
              <p className="mt-4 font-sans text-xs uppercase tracking-[0.2em] text-[#A9B8D0]">
                Last updated · July 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* White island */}
      <div className="relative z-20 flex w-full flex-col bg-[#F7F4EC]">
        <section className="w-full px-6 py-16 md:px-12 md:py-24">
          <div className="mx-auto max-w-3xl space-y-12">
            {SECTIONS.map((section) => (
              <div key={section.heading}>
                <h2 className="mb-4 font-serif text-2xl font-normal tracking-wide text-[#13294B]">
                  {section.heading}
                </h2>
                {section.body.map((para) => (
                  <p key={para.slice(0, 32)} className="font-body text-sm leading-[1.85] text-[#3A4E6B]">
                    {para}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </section>
        <Footer />
      </div>
    </main>
  );
}
