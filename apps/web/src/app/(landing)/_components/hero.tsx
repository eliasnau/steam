"use client";

import { Database, Download, ExternalLink, FolderOpen, TrendingUp } from "lucide-react";
import type { MouseEvent } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogDescription,
	DialogHeader,
	DialogPopup,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";

interface HeroProps {
	totalGames: number;
}

export function Hero({ totalGames }: HeroProps) {
	const scrollToSection = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
		event.preventDefault();
		const section = document.getElementById(id);
		section?.scrollIntoView({ behavior: "smooth", block: "start" });
	};

	return (
		<section className="relative flex min-h-screen items-center overflow-hidden">
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-background" />

				<div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
				<div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />

				<div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.7_0.2_180_/_0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.7_0.2_180_/_0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

				<div className="absolute top-1/3 left-1/4 h-[600px] w-[600px] animate-pulse-glow rounded-full bg-[#72F5F8]/20 blur-[150px]" />
				<div
					className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] animate-pulse-glow rounded-full bg-neon-pink/8 blur-[120px]"
					style={{ animationDelay: "1s" }}
				/>
			</div>

			<div className="mx-auto max-w-7xl px-6 py-20">
				<div className="flex flex-col items-center text-center">
					<h1 className="relative [font-family:var(--font-lemon-milk-bold)] text-6xl tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl">
						<span className="text-[#C0C0C0]">STEAM</span>
						<span className="bg-linear-to-b from-[#51A9F3] to-[#72F5F8] bg-clip-text text-transparent">
							ENGINE
						</span>
					</h1>

					<div className="mt-6 flex items-center gap-3">
						<div className="h-px w-12 bg-gradient-to-r from-transparent to-[#72F5F8]/70" />
						<span className="font-bold text-[#72F5F8]/70 text-xs tracking-[0.3em]">
							Steam Spiele
						</span>
						<div className="h-px w-12 bg-gradient-to-l from-transparent to-[#72F5F8]/70" />
					</div>

					<p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed md:text-xl">
						Entdecke{" "}
						<span className="font-semibold text-[#51A9F3]">
							{totalGames} Spiele
						</span>{" "}
						mit detaillierten Infos zu Genres, Tags, Preisen,
						Entwicklern und Analysen.
					</p>

					<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
						<Button
							size="lg"
							className="h-14 border-transparent bg-linear-to-b from-[#51A9F3] to-[#72F5F8] px-10 font-bold text-base text-primary-foreground tracking-wider shadow-none transition-all duration-300 before:hidden hover:scale-105 hover:from-[#4A9CE0] hover:to-[#66E3E6]"
							render={(props) => (
								<a {...props} href="#games" onClick={scrollToSection("games")}>
									<Database className="mr-2 h-5 w-5" />
									SPIELE DURCHSUCHEN
								</a>
							)}
						/>
						<Button
							size="lg"
							variant="outline"
							className="h-14 border-neon-pink/50 bg-transparent px-10 font-bold text-base text-[#7800FF] tracking-wider transition-all duration-300 hover:scale-105 hover:border-neon-pink hover:bg-neon-pink/10"
							render={(props) => (
								<a
									{...props}
									href="#statistics"
									onClick={scrollToSection("statistics")}
								>
									<TrendingUp className="mr-2 h-5 w-5" />
									STATISTIKEN ANSEHEN
								</a>
							)}
						/>
					</div>

					<Dialog>
						<DialogTrigger render={<Button variant="outline" className="mt-8 h-11 border-border/50 bg-card/20 px-6 text-muted-foreground tracking-wide hover:border-[#72F5F8]/40 hover:text-[#51A9F3]" />}>
							<FolderOpen className="mr-2 h-4 w-4" />
							Ressourcen
						</DialogTrigger>
						<DialogPopup className="max-w-xl">
							<DialogHeader>
								<DialogTitle>Ressourcen</DialogTitle>
								<DialogDescription>
									Alle Projekt Ressourcen.
								</DialogDescription>
							</DialogHeader>
							<div className="grid gap-2 px-6 pb-6 sm:grid-cols-3">
								<a
									href="https://steamengine-info.notion.site/"
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center justify-center gap-2 rounded-md border border-border/40 bg-card/30 px-3 py-2 text-muted-foreground text-xs tracking-wide transition-colors hover:border-[#72F5F8]/40 hover:text-[#51A9F3]"
								>
									<ExternalLink className="h-3.5 w-3.5" />
									Notion (Infos, Aufgabe)
								</a>
								<a
									href="https://tx1q9eycmeeamfzu.public.blob.vercel-storage.com/SteamEngine.odb"
									download="SteamEngine.odb"
									className="inline-flex items-center justify-center gap-2 rounded-md border border-border/40 bg-card/30 px-3 py-2 text-muted-foreground text-xs tracking-wide transition-colors hover:border-[#72F5F8]/40 hover:text-[#51A9F3]"
								>
									<Download className="h-3.5 w-3.5" />
									Libre Office DB Download
								</a>
								<a
									href="https://tx1q9eycmeeamfzu.public.blob.vercel-storage.com/SteamEngine.key"
									download="SteamEngine.key"
									className="inline-flex items-center justify-center gap-2 rounded-md border border-border/40 bg-card/30 px-3 py-2 text-muted-foreground text-xs tracking-wide transition-colors hover:border-[#72F5F8]/40 hover:text-[#51A9F3]"
								>
									<Download className="h-3.5 w-3.5" />
									Keynote Präsentation
								</a>
							</div>
						</DialogPopup>
					</Dialog>
				</div>
			</div>
		</section>
	);
}
