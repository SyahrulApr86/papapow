import type { Metadata } from "next";
import { Inter, DM_Serif_Display, Lora } from "next/font/google";
import { Toaster } from "@/components/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const serif = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
  style: ["normal", "italic"],
  weight: ["400", "600"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://papapow.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "PAPAPOW — Monochrome Goods for Daily Motion",
    template: "%s | PAPAPOW",
  },
  description: "PAPAPOW — koleksi fashion monochrome untuk gerakan sehari-hari. Hoodie, tee, polo, dan aksesori dari Jakarta.",
  keywords: ["PAPAPOW", "fashion", "monochrome", "hoodie", "streetwear", "baju", "Jakarta", "clothing"],
  authors: [{ name: "PAPAPOW" }],
  creator: "PAPAPOW",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    siteName: "PAPAPOW",
    title: "PAPAPOW — Monochrome Goods for Daily Motion",
    description: "Koleksi fashion monochrome untuk gerakan sehari-hari. Hoodie, tee, polo, dan aksesori dari Jakarta.",
    images: [{ url: "/images/logo-white.jpg", width: 1200, height: 630, alt: "PAPAPOW" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PAPAPOW — Monochrome Goods for Daily Motion",
    description: "Koleksi fashion monochrome untuk gerakan sehari-hari.",
    images: ["/images/logo-white.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: siteUrl },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${inter.variable} ${serif.variable} ${lora.variable}`}>
      <body>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
