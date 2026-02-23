"use client";

import { Database, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
	totalGames: number;
	gameImages: Array<{ name: string; image: string }>;
}

export function Hero({ totalGames, gameImages }: HeroProps) {
	// Split images into 3 columns for the scrolling mosaic
	const col1 = gameImages.slice(0, 4);
	const col2 = gameImages.slice(4, 8);
	const col3 = gameImages.slice(8, 12);

	return (
		<section className="relative flex min-h-screen items-center overflow-hidden">
			{/* Scrolling game covers background */}
			<div className="absolute inset-0 -z-10">
				{/* Dark base */}
				<div className="absolute inset-0 bg-background" />

				{/* Game covers mosaic - 3 columns scrolling at different speeds */}
				<div className="absolute inset-0 flex gap-3 opacity-[0.12] blur-[1px]">
					{(
						[
							{ id: "left", items: col1, direction: "up", delay: 0 },
							{ id: "center", items: col2, direction: "down", delay: -3 },
							{ id: "right", items: col3, direction: "up", delay: -6 },
						] as const
					).map((column) => (
						<div
							key={column.id}
							className="relative flex-1 overflow-hidden"
						>
							<div
								className={`flex flex-col gap-3 ${
									column.direction === "up"
										? "animate-[scroll-up_25s_linear_infinite]"
										: "animate-[scroll-down_30s_linear_infinite]"
								}`}
								style={{
									animationDelay: `${column.delay}s`,
								}}
							>
								{/* Double the images for seamless loop */}
								{[...column.items, ...column.items, ...column.items].map(
									(game, idx) => (
										<div
											key={`${game.name}-${idx}`}
											className="aspect-[460/215] w-full overflow-hidden rounded-lg"
										>
											<img
												src={game.image}
												alt=""
												className="h-full w-full object-cover"
												loading="eager"
											/>
										</div>
									),
								)}
							</div>
						</div>
					))}
				</div>

				{/* Gradient overlays for depth */}
				<div className="absolute inset-0 bg-gradient-to-b from-background via-background/60 to-background" />
				<div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />

				{/* Grid pattern */}
				<div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.7_0.2_180_/_0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.7_0.2_180_/_0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

				{/* Glow orbs */}
				<div className="absolute top-1/3 left-1/4 h-[600px] w-[600px] animate-pulse-glow rounded-full bg-[#87FF00]/8 blur-[150px]" />
				<div
					className="absolute right-1/4 bottom-1/3 h-[400px] w-[400px] animate-pulse-glow rounded-full bg-neon-pink/8 blur-[120px]"
					style={{ animationDelay: "1s" }}
				/>
			</div>

			{/* Content */}
			<div className="mx-auto max-w-7xl px-6 py-20">
				<div className="flex flex-col items-center text-center">
					{/* Main title — one word, split color */}
					<h1 className="relative font-black text-6xl tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl">
						<span className="text-[#C0C0C0]">STEAM</span>
						<span className="text-glow-[#87FF00] text-[#87FF00]">
							ENGINE
						</span>
					</h1>

					{/* Accent line */}
					<div className="mt-6 flex items-center gap-3">
						<div className="h-px w-12 bg-gradient-to-r from-transparent to-[#87FF00]/60" />
						<span className="font-bold text-[#87FF00]/60 text-xs tracking-[0.3em]">
							Steam Spiele
						</span>
						<div className="h-px w-12 bg-gradient-to-l from-transparent to-[#87FF00]/60" />
					</div>

					<p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground leading-relaxed md:text-xl">
						Entdecke{" "}
						<span className="font-semibold text-neon-cyan">
							{totalGames}+ Spiele
						</span>{" "}
						mit detaillierten Infos zu Genres, Tags, Preisen,
						Entwicklern und Analysen.
					</p>

					<div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
						<Button
							size="lg"
							className="glow-[#87FF00] h-14 bg-[#87FF00] px-10 font-bold text-base text-primary-foreground tracking-wider transition-all duration-300 hover:scale-105 hover:bg-[#87FF00]/90"
							render={(props) => (
								<a {...props} href="#games">
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
								<a {...props} href="#statistics">
									<TrendingUp className="mr-2 h-5 w-5" />
									STATISTIKEN ANSEHEN
								</a>
							)}
						/>
					</div>
				</div>
			</div>
		</section>
	);
}
