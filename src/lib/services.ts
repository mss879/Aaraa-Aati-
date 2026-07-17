export type Service = {
  slug: string;
  name: string;
  tagline: string;
  paragraphs: string[];
  points?: string[];
  cta?: { label: string; href: string };
};

export const SERVICES: Service[] = [
  {
    slug: "on-call-visits",
    name: "On-Call Atelier Visits",
    tagline: "Concierge Private Access",
    paragraphs: [
      "Experience the luxury of our boutique from the comfort of your home, office, or private suite. Our master gemologist brings curated trays directly to you for private viewings, custom fittings and bespoke styling sessions — presented under honest daylight and evening light, exactly as your jewellery will live.",
      "For clients who prefer to begin remotely, the same consultation is held over video call and WhatsApp: loose stones on camera, designs refined together, and every detail agreed before a single cut is made. Appointments are held to suit Singapore hours.",
    ],
    points: [
      "Private viewings at your home, office or suite",
      "Video and WhatsApp consultations for remote clients",
      "Evening and weekend appointments to Singapore hours",
    ],
    cta: { label: "Arrange a Visit", href: "/contact" },
  },
  {
    slug: "express-acquisitions",
    name: "Last-Minute Private Buys",
    tagline: "Express Armored Delivery",
    paragraphs: [
      "For immediate occasions, bypass standard ordering entirely. Our VIP priority line gives you immediate access to the maison's certified stones, expedited design and setting, and secure hand-courier delivery — insured door to door.",
      "Tell the concierge the occasion and the date; the maison arranges everything in between, with the same certification and lifetime warranty as any commission.",
    ],
    points: [
      "Priority access to certified stones and finished pieces",
      "Expedited design, setting and finishing",
      "Secure, insured hand-courier delivery to Singapore",
    ],
    cta: { label: "Call the Priority Line", href: "/contact" },
  },
  {
    slug: "vault-consultation",
    name: "Vault Consultation & VIP Lounge",
    tagline: "By Private Appointment Only",
    paragraphs: [
      "Schedule a secure, private consultation inside the atelier's vaults. Gain exclusive access to unmounted raw stones, reserve investment-grade Ceylon sapphires, and view historically significant heritage archive designs unavailable anywhere else.",
      "Every stone presented carries its independent laboratory certificate with origin and treatment disclosure, and leaves with a formal valuation for insurance — the documentation discipline of years spent exporting to the world's most exacting buyers.",
    ],
    points: [
      "Unmounted rough and cut stones, viewed in private",
      "Investment-grade and unheated sapphires on reserve",
      "Certification and formal valuation with every stone",
    ],
    cta: { label: "Request an Appointment", href: "/contact" },
  },
];
