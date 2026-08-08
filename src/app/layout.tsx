import type { Metadata, Viewport } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import Preloader from "@/components/fx/Preloader";
import Navbar from "@/components/Navbar";
import FloatingActions from "@/components/FloatingActions";
import AiConcierge from "@/components/AiConcierge";
import {
  ATELIER_ADDRESS,
  BOOKING_URL,
  SUPPORT_EMAIL,
  TELEPHONE_E164,
} from "@/lib/contact";
import { OG_IMAGE, SITE_LOCALE, SITE_NAME, SOCIAL_PROFILES, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Headings: Trajan Pro where installed, with Cinzel (the classic Trajan-style
// Roman capital webfont) as the guaranteed fallback.
const cinzel = Cinzel({
  variable: "--font-trajan",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body: Garamond, served as EB Garamond.
const garamond = EB_Garamond({
  variable: "--font-garamond",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

/**
 * Colour of the browser chrome on mobile — the cream the page actually opens
 * on, so the status bar doesn't flash a default white band above the hero.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F4EC" },
    { media: "(prefers-color-scheme: dark)", color: "#0A1F3D" },
  ],
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default:
      "Ceylon Gem Maison | Bespoke Ceylon Sapphire & Diamond Jewellery, Singapore",
    template: "%s | Ceylon Gem Maison",
  },
  description:
    "Bespoke Ceylon sapphire engagement rings and fine jewellery for Singapore — ethically sourced at origin, cut by hand, priced instantly in our online atelier, and delivered fully insured.",
  keywords: [
    "Ceylon sapphire Singapore",
    "sapphire engagement ring Singapore",
    "bespoke jewellery Singapore",
    "custom engagement ring Singapore",
    "blue sapphire ring",
    "ethically sourced gemstones",
    "Sri Lankan sapphires",
    "bespoke wedding rings Singapore",
  ],
  applicationName: "Ceylon Gem Maison",
  category: "Jewelry",
  creator: "ARC AI",
  publisher: "Ceylon Gem Maison",
  // The default social block. Every public route overrides it via
  // pageMetadata() in src/lib/seo.ts — without that, Next inherits this whole
  // object and every page shares the homepage's og:title and og:url.
  openGraph: {
    title: "Ceylon Gem Maison | Bespoke Ceylon Sapphire & Diamond Jewellery",
    description:
      "Design your own sapphire ring in a live 3D atelier with instant quotations — ethically sourced Ceylon gemstones, delivered insured to Singapore.",
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ceylon Gem Maison | Bespoke Ceylon Sapphire & Diamond Jewellery, Singapore",
    description:
      "Design your own sapphire ring in a live 3D atelier with instant quotations — ethically sourced Ceylon gemstones, delivered insured to Singapore.",
    images: [OG_IMAGE.url],
  },
  formatDetection: { telephone: false, address: false, email: false },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "SG",
    "geo.placename": "Singapore",
  },
};

// Organization + WebSite structured data, shared by every page.
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "JewelryStore",
      "@id": `${SITE_URL}/#organization`,
      name: "Ceylon Gem Maison",
      url: SITE_URL,
      logo: `${SITE_URL}/logo.jpeg`,
      image: `${SITE_URL}${OG_IMAGE.url}`,
      description:
        "Bespoke Ceylon sapphire and diamond jewellery house with years of professional experience exporting world-class, ethically sourced gemstones — serving private clients in Singapore and worldwide.",
      email: SUPPORT_EMAIL,
      telephone: TELEPHONE_E164,
      priceRange: "$$$",
      currenciesAccepted: "SGD, USD",
      paymentAccepted: "Bank transfer, Credit card",
      address: {
        "@type": "PostalAddress",
        streetAddress: ATELIER_ADDRESS.street,
        postalCode: ATELIER_ADDRESS.postalCode,
        addressLocality: ATELIER_ADDRESS.locality,
        addressCountry: ATELIER_ADDRESS.country,
      },
      // Ties the site's entity to its verified public profiles — the strongest
      // signal Google has for "these accounts are the same business".
      sameAs: SOCIAL_PROFILES,
      // The atelier takes appointments, and this is where. Declared as a
      // ReserveAction so search engines and AI assistants can answer "book a
      // consultation" with the real diary rather than a phone number.
      potentialAction: {
        "@type": "ReserveAction",
        name: "Book a private consultation",
        target: {
          "@type": "EntryPoint",
          urlTemplate: BOOKING_URL,
          inLanguage: SITE_LOCALE,
          actionPlatform: [
            "http://schema.org/DesktopWebPlatform",
            "http://schema.org/MobileWebPlatform",
          ],
        },
        result: {
          "@type": "Reservation",
          name: "30-minute private consultation with the atelier concierge",
        },
      },
      // The atelier is by appointment, not a walk-in shopfront.
      openingHoursSpecification: {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
        opens: "10:00",
        closes: "19:00",
      },
      areaServed: [
        { "@type": "Country", name: "Singapore" },
        { "@type": "Country", name: "Sri Lanka" },
      ],
      knowsAbout: [
        "Ceylon sapphires",
        "Bespoke engagement rings",
        "Ethical gemstone sourcing",
        "Gemstone certification",
      ],
      makesOffer: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Bespoke engagement ring commissions",
            serviceType: "Bespoke jewellery design",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Ceylon sapphire sourcing at origin",
            serviceType: "Gemstone sourcing",
          },
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "Ceylon Gem Maison",
      publisher: { "@id": `${SITE_URL}/#organization` },
      creator: {
        "@type": "Organization",
        "name": "ARC AI",
        "url": "https://www.arcai.agency",
        "logo": `${SITE_URL}/arc-logo.webp`
      },
      inLanguage: "en-SG",
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-SG"
      className={`${cinzel.variable} ${garamond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F4EC] text-[#13294B]">
        <Preloader />
        <Navbar />
        <FloatingActions />
        <AiConcierge />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
