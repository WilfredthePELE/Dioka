import type { Metadata } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "./globals.css";
import "./editorial-theme.css";

export const metadata: Metadata = {
  title: "Dioka — Bags, Footwear & Leather Jackets",
  description: "Considered leather pieces for every version of you. Explore bags, footwear, and jackets from Dioka.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
