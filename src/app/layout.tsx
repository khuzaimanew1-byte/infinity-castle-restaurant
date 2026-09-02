import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0B0906",
};

export const metadata: Metadata = {
  title: "Infinity Castle Dining · Demon Slayer Restaurant in Bahawalpur",
  description:
    "Bahawalpur's first Demon Slayer themed dining hall. Every dish named for a Hashira or a demon. Open daily 10:00–23:30. Opposite Aleena Hospital, Ahmedpur Road.",
  keywords: [
    "Infinity Castle Dining",
    "Demon Slayer restaurant Bahawalpur",
    "anime restaurant Pakistan",
    "themed restaurant Bahawalpur",
    "Hashira dining",
  ],
  openGraph: {
    title: "Infinity Castle Dining · Bahawalpur",
    description:
      "Bahawalpur's first Demon Slayer dining hall. Every dish named for a Hashira or a demon. Open daily 10:00–23:30.",
    siteName: "Infinity Castle Dining",
    locale: "en_PK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Infinity Castle Dining · Bahawalpur",
    description:
      "Bahawalpur's first Demon Slayer dining hall. Open daily 10:00–23:30.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-void text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
