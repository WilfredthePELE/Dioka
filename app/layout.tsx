import type { Metadata } from "next";
import "@fontsource-variable/cormorant-garamond";
import "@fontsource-variable/cormorant-garamond/wght-italic.css";
import "./globals.css";
import "./editorial-theme.css";

import { ClientProviders } from "@/components/ClientProviders";

export const metadata: Metadata = {
  title: "Dioka",
  description: "Bags, Footwear & Leather Jackets storefront",
  openGraph: {
    title: "Dioka",
    description: "Bags, Footwear & Leather Jackets storefront",
  },
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
