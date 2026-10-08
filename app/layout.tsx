import type { Metadata } from "next";
import "@fontsource-variable/cormorant-garamond/wght.css";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "./globals.css";
import "./editorial-theme.css";

import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Dioka — Bags, Footwear & Leather Jackets",
  description: "Bags, Footwear & Leather Jackets storefront",
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
      <body className="antialiased">
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
