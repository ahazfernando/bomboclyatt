import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Emberdex — Trade Pokémon cards & collectibles",
  description:
    "A community marketplace for Pokémon cards and collectibles. Buy, sell, review, and win drops.",
  authors: [{ name: "Emberdex" }],
  icons: { icon: "/favicon.ico" },
  openGraph: {
    title: "Emberdex — Trade Pokémon cards & collectibles",
    description: "A community marketplace for Pokémon cards and collectibles.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
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
