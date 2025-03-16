import { Geist, Geist_Mono } from 'next/font/google';

import '@nzc/ui/styles/globals.css';
import { cn } from '@nzc/ui/lib/utils';
import type { Metadata, Viewport } from 'next';
import type * as React from 'react';
import { siteConfig } from '~/config/site';
import { env } from '~/env';
import { Providers } from '~/providers';

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
});

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(env.NEXT_PUBLIC_MERCHANT_URL),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    'next.js',
    'turborepo',
    'typescript',
    'trpc',
    'drizzle-orm',
    'shadcn-ui',
    'zod',
    'bun',
    'turborepo',
    'monorepo',
    'biome',
  ],
  authors: [
    {
      name: 'Muhammad Isa',
      url: 'https://www.muhammadisa.com',
    },
  ],
  creator: 'muhammad-rk-isa',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: '/favicon.ico',
  },
  manifest: `${env.NEXT_PUBLIC_MERCHANT_URL}/site.webmanifest`,
};

export const viewport: Viewport = {
  colorScheme: 'dark light',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={cn(
          fontSans.variable,
          fontMono.variable,
          'scroll-smooth font-sans antialiased'
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
