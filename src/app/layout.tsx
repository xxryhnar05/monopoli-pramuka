import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bricolage = localFont({
  src: "./fonts/bricolage-grotesque-latin.woff2",
  weight: "600 800",
  variable: "--font-bricolage",
  display: "swap",
});

const jakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  weight: "400 800",
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Monopoli Nusantara – The Indonesian Scout Adventure",
  description:
    "Jelajahi Nusantara, kuasai wilayahnya! Game papan edukasi Pramuka: beli destinasi wisata Indonesia, bangun resort, dan uji pengetahuan kepramukaan.",
};

export const viewport: Viewport = {
  themeColor: "#174D36",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${bricolage.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
