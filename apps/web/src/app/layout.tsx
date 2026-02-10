import type { Metadata } from "next";
import localFont from 'next/font/local'
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Providers from "@/components/providers";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const lemonmilk_reg = localFont({
  src: './LEMONMILK-Regular.otf',
  variable: "--lemonmilk-reg",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "repo",
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
