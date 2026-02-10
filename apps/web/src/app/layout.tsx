import type { Metadata } from "next";
import localFont from 'next/font/local'
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { Suspense } from "react";

const geistSans = localFont({
  src: './LEMONMILK-Regular.otf',
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = localFont({
  src: './LEMONMILK-Regular.otf',
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SteamEngine",
  description: "repo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Suspense>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            {children}
          </div>
        </Providers>
        </Suspense>
      </body>
    </html>
  );
}
