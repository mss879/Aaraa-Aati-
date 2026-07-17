import type { Metadata } from "next";
import { Cinzel, EB_Garamond } from "next/font/google";
import Preloader from "@/components/fx/Preloader";
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

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.ceylongemmaison.com";

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
  openGraph: {
    title: "Ceylon Gem Maison | Bespoke Ceylon Sapphire & Diamond Jewellery",
    description:
      "Design your own sapphire ring in a live 3D atelier with instant quotations — ethically sourced Ceylon gemstones, delivered insured to Singapore.",
    type: "website",
    url: "/",
    siteName: "Ceylon Gem Maison",
    locale: "en_SG",
    images: [
      {
        url: "/og.png",
        width: 1024,
        height: 1024,
        alt: "Ceylon Gem Maison cushion-cut Ceylon sapphire and diamond ring on blue silk background",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ceylon Gem Maison | Bespoke Ceylon Sapphire & Diamond Jewellery, Singapore",
    description:
      "Design your own sapphire ring in a live 3D atelier with instant quotations — ethically sourced Ceylon gemstones, delivered insured to Singapore.",
    images: ["/og.png"],
  },
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
      image: `${SITE_URL}/og.png`,
      description:
        "Bespoke Ceylon sapphire and diamond jewellery house with years of professional experience exporting world-class, ethically sourced gemstones — serving private clients in Singapore and worldwide.",
      email: "support@ceylongemmaison.com",
      priceRange: "$$$",
      currenciesAccepted: "SGD, USD",
      address: {
        "@type": "PostalAddress",
        streetAddress: "66 Flora Road, #05-10, The Gale",
        postalCode: "506912",
        addressLocality: "Singapore",
        addressCountry: "SG",
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
      lang="en"
      className={`${cinzel.variable} ${garamond.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F4EC] text-[#13294B]">
        <Preloader />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
