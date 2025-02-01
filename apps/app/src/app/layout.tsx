import "~/styles/globals.css";

import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import Providers from "~/components/providers";
import { siteConfig } from "~/config/site";

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} scroll-smooth bg-background font-sans text-primary antialiased selection:bg-pink-500 selection:text-foreground`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
