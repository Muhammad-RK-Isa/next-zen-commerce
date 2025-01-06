import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "~/styles/globals.css";

import { APP_TITLE } from "../lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_TITLE,
  description: "Developed by Muhammad Isa",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} scroll-smooth font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
