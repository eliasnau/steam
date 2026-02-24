import type { Metadata } from "next";
import localFont from "next/font/local";

import "../index.css";
import Providers from "@/components/providers";
import { Suspense } from "react";

const lemonMilkRegular = localFont({
	src: "./LEMONMILK-Regular.otf",
	variable: "--font-lemon-milk",
	subsets: ["latin"],
});

const lemonMilkBold = localFont({
	src: "../font/LEMONMILK-Bold.otf",
	variable: "--font-lemon-milk-bold",
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
			<body
				className={`${lemonMilkRegular.variable} ${lemonMilkBold.variable} antialiased`}
			>
				<Providers>
					<Suspense>
						<div className="grid h-svh grid-rows-[auto_1fr]">{children}</div>
					</Suspense>
				</Providers>
			</body>
		</html>
	);
}
