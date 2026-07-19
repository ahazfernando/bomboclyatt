import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

const siteName = "BomboClyatt";
const siteTitle = "BomboClyatt — Buy & Sell Collectible Items";
const siteDescription =
  "BomboClyatt is a marketplace to buy and sell collectible items — trading cards, sealed product, slabs, comics, diecast, and more. List your collection and find your next piece.";
const logoUrl = "/logo/BomboClyatt.png";

export const metadata: Metadata = {
  metadataBase: new URL("https://bomboclyatt.com"),
  title: {
    default: siteTitle,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  keywords: [
    "BomboClyatt",
    "buy collectibles",
    "sell collectibles",
    "collectible marketplace",
    "trading cards",
    "sealed product",
    "graded cards",
    "slabs",
    "comics",
    "diecast",
    "collectibles for sale",
  ],
  icons: {
    icon: logoUrl,
    apple: logoUrl,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    siteName,
    type: "website",
    locale: "en_US",
    images: [
      {
        url: logoUrl,
        alt: `${siteName} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [logoUrl],
  },
  category: "shopping",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Grotesk:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
