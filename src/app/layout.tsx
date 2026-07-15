import type { Metadata } from "next";
import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001"),
  title: {
    default: "Aura Jewelers | Luxury Jewelry & Bespoke Atelier",
    template: "%s | Aura Jewelers",
  },
  description:
    "Exquisite craftsmanship and timeless elegance. Experience the finest collection of luxury jewelry, custom rings, and bespoke necklaces — or design your own in our interactive atelier.",
  openGraph: {
    title: "Aura Jewelers | Luxury Jewelry & Bespoke Atelier",
    description:
      "Design your own engagement ring in a live 3D atelier — setting, metal, gemstone, cut and carat — rendered by AI.",
    type: "website",
    siteName: "Aura Jewelers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#0b0b0c] text-[#f7f5f0]">
        {children}
      </body>
    </html>
  );
}
