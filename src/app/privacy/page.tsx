import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Ceylon Gem Maison collects, uses and protects your personal information across our website, digital atelier and private client services.",
  alternates: { canonical: "/privacy" },
  robots: { index: false },
};

const SECTIONS: { heading: string; body: string[] }[] = [
  {
    heading: "Information We Collect",
    body: [
      "When you use our website, digital atelier or contact channels, we may collect: your name and contact details (email address, phone or WhatsApp number) when you submit an enquiry or booking request; the design specifications you compose in the atelier (piece, setting, metal, gemstone, cut, carat) so we can prepare your quotation; and standard technical data such as browser type and pages visited, used in aggregate to improve the site.",
    ],
  },
  {
    heading: "How We Use Your Information",
    body: [
      "We use your information solely to respond to enquiries, prepare quotations, arrange consultations and fittings, fulfil and deliver commissions, and provide after-care under our lifetime warranty. With your consent, we may occasionally share private catalogues or event invitations. We never sell, rent or trade your personal information to third parties.",
    ],
  },
  {
    heading: "Sharing & Third Parties",
    body: [
      "Your details are shared only where necessary to serve you: with insured courier partners for delivery, with independent gemmological laboratories for certification, and with payment providers for transactions you initiate. Each partner receives only what is required for their role. Communications over WhatsApp are subject to WhatsApp's own terms and encryption.",
    ],
  },
  {
    heading: "Data Retention & Security",
    body: [
      "Commission records are retained for the life of your piece so we can honour our lifetime warranty, valuations and resizing service. Enquiry data that does not lead to a commission is deleted within a reasonable period. We apply appropriate technical and organisational safeguards to all data we hold.",
    ],
  },
  {
    heading: "Your Rights",
    body: [
      "You may request access to, correction of, or deletion of your personal data at any time, subject to records we must keep for legal or warranty purposes. We honour the requirements of Singapore's Personal Data Protection Act (PDPA) and other applicable data protection laws in the jurisdictions we serve.",
    ],
  },
  {
    heading: "Contact",
    body: [
      "For any privacy question or request, write to support@ceylongemmaison.com and we will respond promptly.",
    ],
  },
];

export default function PrivacyPage() {
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
                Privacy <span className="italic text-gold-200">Policy</span>
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
            <p className="font-body text-sm leading-relaxed text-[#3A4E6B] md:text-base">
              Ceylon Gem Maison respects the discretion our clients expect of a
              private jeweller. This policy explains what we collect through
              ceylongemmaison.com and our client channels, why we collect it,
              and the choices you have.
            </p>
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
