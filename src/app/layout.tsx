import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";

// ── Latin fonts via next/font — zero render-blocking ──────────────────────
// Why: next/font self-hosts these at build time → <link rel="preload"> generated
// automatically → eliminates Google Fonts DNS round-trip for Latin characters.
// Noto Serif JP (CJK) stays in globals.css @import because next/font cannot
// subset CJK at build time in some environments (requires large font download).
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://infinitycastledining.com";

export const viewport: Viewport = {
  themeColor: "#0B0906",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Infinity Castle Dining · Demon Slayer Restaurant in Bahawalpur",
    template: "%s · Infinity Castle Dining",
  },
  description:
    "Bahawalpur's first Demon Slayer-themed dining hall. Hashira & demon-named dishes, immersive decor, exclusive passes. Open daily 10:00–23:30 on Ahmedpur Road.",
  keywords: [
    "Infinity Castle Dining",
    "Demon Slayer restaurant Bahawalpur",
    "anime restaurant Pakistan",
    "themed restaurant Bahawalpur",
    "Hashira dining experience",
    "best restaurant Bahawalpur",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Infinity Castle Dining · Bahawalpur",
    description:
      "Bahawalpur's first Demon Slayer dining hall. Every dish named for a Hashira or demon. Open daily 10:00–23:30.",
    url: SITE_URL,
    siteName: "Infinity Castle Dining",
    locale: "en_PK",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Infinity Castle Dining — Demon Slayer themed restaurant in Bahawalpur",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinity Castle Dining · Bahawalpur",
    description:
      "Bahawalpur's first Demon Slayer dining hall. Open daily 10:00–23:30.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

// JSON-LD structured data — Restaurant schema for Google rich results
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Infinity Castle Dining",
  description:
    "Bahawalpur's first Demon Slayer-themed dining hall. Hashira & demon-named dishes, immersive decor.",
  url: SITE_URL,
  telephone: "+923088880105",
  priceRange: "Rs 1,000 – 2,000",
  servesCuisine: ["Pakistani", "Continental", "Chinese"],
  openingHours: "Mo-Su 10:00-23:30",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Opposite Aleena Hospital, Ahmedpur Road, Nawab Colony",
    addressLocality: "Bahawalpur",
    postalCode: "63100",
    addressCountry: "PK",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 29.3821875,
    longitude: 71.6570625,
  },
  sameAs: [
    "https://www.instagram.com/huzaefaa_official",
    "https://www.tiktok.com/@infinity_castle_official",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${playfair.variable} ${inter.variable}`}
    >
      <head>
        {/* DNS preconnect for Noto Serif JP (CJK — loaded via CSS @import in globals.css) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* JSON-LD structured data for Google rich results */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-void text-ink antialiased">{children}</body>
    </html>
  );
}
