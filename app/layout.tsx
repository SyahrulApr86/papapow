import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PAPAPOW Catalog",
  description: "Black-and-white minimalist fashion catalog.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
