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

export const metadata: Metadata = {
  title: "PAPAPOW",
  description: "Monochrome goods for daily motion.",
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
