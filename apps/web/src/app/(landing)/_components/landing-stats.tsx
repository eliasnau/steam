"use client";

import {
	BarChart3,
	Building2,
	DollarSign,
	Gamepad2,
	Star,
	Tag,
	Users,
	Zap,
} from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { Badge } from "@/components/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

interface LandingStatsProps {
	topGenres: Array<{ genreId: string; genreName: string; gameCount: number }>;
	popularTags: Array<{ tagId: string; tagName: string; gameCount: number }>;
	topDevelopers: Array<{
		developerId: string;
		developerName: string;
		avgRating: number;
		gameCount: number;
	}>;
	topRatedGames: Array<{
		gameId: string;
		gameName: string;
		rating: number;
		totalReviews: number;
		price: string | null;
	}>;
	priceDistribution: Array<{
		range: string;
		count: number;
	}>;
	stats: {
		totalGames: number;
		avgRating: number;
		avgPrice: string | null;
		freeGames: number;
	};
}

const COLORS = [
	"oklch(0.7 0.2 180)", 
	"oklch(0.65 0.25 320)",
	"oklch(0.75 0.18 90)", 
	"oklch(0.6 0.2 260)",
	"oklch(0.7 0.22 30)",
];

const chartConfig = {
	count: { label: "Spiele", color: "oklch(0.7 0.2 180)" },
	name: { label: "Genre" },
	Free: { label: "Kostenlos", color: "oklch(0.7 0.2 180)" },
	"Under $10": { label: "Unter $10", color: "oklch(0.65 0.25 320)" },
	"Under $20": { label: "Unter $20", color: "oklch(0.75 0.18 90)" },
	"Under $50": { label: "Unter $50", color: "oklch(0.6 0.2 260)" },
	"Over $50": { label: "Über $50", color: "oklch(0.7 0.22 30)" },
} satisfies import("@/components/ui/chart").ChartConfig;

export function LandingStats({
	topGenres,
	popularTags,
	topDevelopers,
	topRatedGames,
	priceDistribution,
	stats,
}: LandingStatsProps) {
	const genreData = topGenres.map((g, index) => ({
		name: g.genreName,
		count: Number(g.gameCount),
		fill: COLORS[index % COLORS.length],
	}));

	const priceData = priceDistribution.map((p, index) => ({
		name: p.range,
		count: Number(p.count),
		fill: COLORS[index % COLORS.length],
	}));

	return (
		<section id="statistics" className="relative bg-background">
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.7_0.2_180_/_0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.7_0.2_180_/_0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
				<div className="absolute top-1/3 right-0 h-[600px] w-[600px] rounded-full bg-accent/5 blur-[150px]" />
				<div className="absolute bottom-1/3 left-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
			</div>

			<div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
				<div className="mb-16 flex flex-col items-center text-center">
					<div className="glow-pink mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-pink/30 bg-neon-pink/10">
						<BarChart3 className="h-8 w-8 text-neon-pink" />
					</div>
					<h2 className="font-black text-4xl tracking-tight md:text-5xl">
						<span className="text-glow-pink text-neon-pink">ANALYTICS</span>{" "}
						DASHBOARD
					</h2>
					<p className="mt-4 max-w-xl text-lg text-muted-foreground">
						Echtzeit-Einblicke aus unserer Steam-Spiele-Sammlung
					</p>
				</div>

				<div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/30">
						<div className="absolute inset-0 bg-gradient-to-br from-neon-yellow/20 to-neon-yellow/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
						<CardContent className="relative flex items-center gap-5 p-6">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-yellow/30 bg-neon-yellow/10">
								<Star className="h-8 w-8 text-neon-yellow" />
							</div>
							<div>
								<p className="font-bold text-[10px] text-muted-foreground tracking-[0.2em]">
									Ø BEWERTUNG
								</p>
								<p className="font-black text-4xl tracking-tight">
									{stats.avgRating
										? (Number(stats.avgRating) * 100).toFixed(1)
										: "0"}
									<span className="font-bold text-lg text-muted-foreground">
										%
									</span>
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/30">
						<div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/20 to-neon-cyan/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
						<CardContent className="relative flex items-center gap-5 p-6">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10">
								<DollarSign className="h-8 w-8 text-neon-cyan" />
							</div>
							<div>
								<p className="font-bold text-[10px] text-muted-foreground tracking-[0.2em]">
									Ø PREIS
								</p>
								<p className="font-black text-4xl tracking-tight">
									${stats.avgPrice ? Number(stats.avgPrice).toFixed(0) : 0}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/30">
						<div className="absolute inset-0 bg-gradient-to-br from-neon-pink/20 to-neon-pink/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
						<CardContent className="relative flex items-center gap-5 p-6">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-pink/30 bg-neon-pink/10">
								<Users className="h-8 w-8 text-neon-pink" />
							</div>
							<div>
								<p className="font-bold text-[10px] text-muted-foreground tracking-[0.2em]">
									SPIELE GESAMT
								</p>
								<p className="font-black text-4xl tracking-tight">
									{Number(stats.totalGames).toString()}
								</p>
							</div>
						</CardContent>
					</Card>

					<Card className="group relative overflow-hidden border-border bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/30">
						<div className="absolute inset-0 bg-gradient-to-br from-neon-orange/20 to-neon-orange/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
						<CardContent className="relative flex items-center gap-5 p-6">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-orange/30 bg-neon-orange/10">
								<Zap className="h-8 w-8 text-neon-orange" />
							</div>
							<div>
								<p className="font-bold text-[10px] text-muted-foreground tracking-[0.2em]">
									KOSTENLOSE SPIELE
								</p>
								<p className="font-black text-4xl tracking-tight">
									{Number(stats.freeGames).toString()}
									<span className="font-bold text-lg text-muted-foreground">
										/{Number(stats.totalGames)}
									</span>
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div className="grid gap-6 lg:grid-cols-2">
					<Card className="border-border bg-card/50 backdrop-blur-sm">
						<CardHeader className="pb-2">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10">
									<Gamepad2 className="h-5 w-5 text-neon-cyan" />
								</div>
								<div>
									<CardTitle className="font-black text-lg tracking-wide">
										SPIELE NACH GENRE
									</CardTitle>
									<CardDescription>Verteilung über Kategorien</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pt-4">
							<ChartContainer config={chartConfig} className="h-[350px] w-full">
								<BarChart
									data={genreData}
									layout="vertical"
									margin={{ left: 0, right: 30 }}
								>
									<XAxis type="number" hide />
									<YAxis
										dataKey="name"
										type="category"
										tickLine={false}
										axisLine={false}
										width={110}
										tick={{
											fill: "oklch(0.6 0 0)",
											fontSize: 12,
											fontWeight: 600,
										}}
									/>
									<ChartTooltip
										cursor={{ fill: "oklch(0.7 0.2 180 / 0.1)" }}
										content={({ active, payload }) => {
											if (!active || !payload?.length) return null;
											const data = payload[0].payload;
											return (
												<div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
													<p className="font-bold">{data.name}</p>
													<p className="text-muted-foreground text-sm">
														{data.count} Spiele
													</p>
												</div>
											);
										}}
									/>
									<Bar dataKey="count" radius={[0, 8, 8, 0]}>
										{genreData.map((entry, index) => (
											<Cell
												key={entry.name}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Bar>
								</BarChart>
							</ChartContainer>
						</CardContent>
					</Card>

					<Card className="border-border bg-card/50 backdrop-blur-sm">
						<CardHeader className="pb-2">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-pink/30 bg-neon-pink/10">
									<DollarSign className="h-5 w-5 text-neon-pink" />
								</div>
								<div>
									<CardTitle className="font-black text-lg tracking-wide">
										PREISVERTEILUNG
									</CardTitle>
									<CardDescription>Spiele nach Preisklassen</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pt-4">
							<ChartContainer config={chartConfig} className="h-[280px] w-full">
								<PieChart>
									<ChartTooltip
										content={({ active, payload }) => {
											if (!active || !payload?.length) return null;
											const data = payload[0].payload;
											return (
												<div className="rounded-lg border border-border bg-card px-3 py-2 shadow-lg">
													<p className="font-bold">{data.name}</p>
													<p className="text-muted-foreground text-sm">
														{data.count} Spiele
													</p>
												</div>
											);
										}}
									/>
									<Pie
										data={priceData}
										dataKey="count"
										nameKey="name"
										cx="50%"
										cy="50%"
										innerRadius={80}
										outerRadius={120}
										paddingAngle={4}
										strokeWidth={0}
									>
										{priceData.map((entry, index) => (
											<Cell
												key={entry.name}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
								</PieChart>
							</ChartContainer>
							<div className="mt-4 flex flex-wrap justify-center gap-4">
								{priceData.map((item, index) => (
									<div key={item.name} className="flex items-center gap-2">
										<div
											className="h-3 w-3 rounded-full"
											style={{ backgroundColor: COLORS[index % COLORS.length] }}
										/>
										<span className="text-muted-foreground text-sm">
											{item.name}{" "}
											<span className="font-bold text-foreground">
												({item.count})
											</span>
										</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
					
					<Card className="border-border bg-card/50 backdrop-blur-sm lg:col-span-2">
						<CardHeader className="pb-2">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-orange/30 bg-neon-orange/10">
									<Building2 className="h-5 w-5 text-neon-orange" />
								</div>
								<div>
									<CardTitle className="font-black text-lg tracking-wide">
										DIE BESTEN ENTWICKLER STUDIOS
									</CardTitle>
									<CardDescription>
										Bestbewertete Studios (mind. 3 Spiele)
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="pt-6">
							<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
								{topDevelopers.map((dev, index) => (
									<div
										key={dev.developerId}
										className="group flex flex-col gap-4 rounded-xl border border-border bg-secondary/30 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/50"
									>
										<div className="flex items-center gap-3">
											<div
												className="flex h-12 w-12 items-center justify-center rounded-xl font-black text-background text-lg"
												style={{
													backgroundColor: COLORS[index % COLORS.length],
												}}
											>
												#{index + 1}
											</div>
											<div className="min-w-0 flex-1">
												<p className="truncate font-bold text-sm transition-colors group-hover:text-neon-cyan">
													{dev.developerName}
												</p>
												<p className="text-muted-foreground text-xs">
													{Number(dev.gameCount)} Spiel
													{Number(dev.gameCount) !== 1 ? "e" : ""}
												</p>
											</div>
										</div>
										<div className="flex items-center justify-center gap-2 rounded-xl border border-neon-yellow/30 bg-neon-yellow/10 px-4 py-2">
											<Star className="h-5 w-5 fill-neon-yellow text-neon-yellow" />
											<span className="font-black text-lg text-neon-yellow">
												{dev.avgRating
													? (Number(dev.avgRating) * 100).toFixed(1)
													: 0}
												%
											</span>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>
				</div>
				<Card className="mt-6 border-border bg-card/50 backdrop-blur-sm">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-yellow/30 bg-neon-yellow/10">
								<Star className="h-5 w-5 text-neon-yellow" />
							</div>
							<div>
								<CardTitle className="font-black text-lg tracking-wide">
									AM BESTEN BEWERTETE SPIELE
								</CardTitle>
								<CardDescription>
									Bestbewertete Titel (mit mind. 100 Bewertungen)
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
							{topRatedGames.map((game, index) => (
								<div
									key={game.gameId}
									className="group flex flex-col gap-4 rounded-xl border border-border bg-secondary/30 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/50"
								>
									<div className="flex items-center gap-3">
										<div
											className="flex h-12 w-12 items-center justify-center rounded-xl font-black text-background text-lg"
											style={{
												backgroundColor: COLORS[index % COLORS.length],
											}}
										>
											#{index + 1}
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate font-bold text-sm transition-colors group-hover:text-neon-cyan">
												{game.gameName}
											</p>
											<p className="text-muted-foreground text-xs">
												{Number(game.totalReviews).toLocaleString()} Bewertungen
											</p>
										</div>
									</div>
									<div className="flex flex-col gap-2">
										<div className="flex items-center justify-center gap-2 rounded-xl border border-neon-yellow/30 bg-neon-yellow/10 px-4 py-2">
											<Star className="h-5 w-5 fill-neon-yellow text-neon-yellow" />
											<span className="font-black text-lg text-neon-yellow">
												{(Number(game.rating) * 100).toFixed(1)}%
											</span>
										</div>
										<div className="text-center">
											<span className="font-bold text-sm">
												{game.price
													? `$${Number(game.price).toFixed(2)}`
													: "Kostenlos"}
											</span>
										</div>
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
				<Card className="mt-6 border-border bg-card/50 backdrop-blur-sm">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10">
								<Tag className="h-5 w-5 text-neon-cyan" />
							</div>
							<div>
								<CardTitle className="font-black text-lg tracking-wide">
									POPULÄRE TAGS
								</CardTitle>
								<CardDescription>
									Beliebteste Tags über alle Spiele
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-6">
						<div className="flex flex-wrap gap-3">
							{popularTags.map((tag, index) => (
								<div
									key={tag.tagId}
									className="group flex items-center gap-3 rounded-full border border-border bg-secondary/50 px-5 py-3 transition-all duration-300 hover:border-neon-cyan/50 hover:bg-neon-cyan/5"
								>
									<div
										className="h-3 w-3 animate-pulse rounded-full"
										style={{ backgroundColor: COLORS[index % COLORS.length] }}
									/>
									<span className="font-bold text-sm tracking-wide">
										{tag.tagName}
									</span>
									<span className="rounded-full bg-background px-3 py-1 font-black text-neon-cyan text-xs">
										{Number(tag.gameCount)}
									</span>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</section>
	);
}
