"use client";

import {
	Database,
	Gamepad2,
	Sparkles,
	Tag,
	TrendingUp,
	Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
	totalGames: number;
	totalGenres: number;
	totalTags: number;
	totalDevelopers: number;
}

interface StatCardProps {
	label: string;
	value: string;
	icon: React.ComponentType<{ className?: string }>;
	colorClasses: {
		bg: string;
		border: string;
		text: string;
	};
}

function StatCard({ label, value, icon: Icon, colorClasses }: StatCardProps) {
	return (
		<div className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:bg-card/80">
			<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

			<div className="relative flex flex-col items-center gap-3">
				<div
					className={`flex h-14 w-14 items-center justify-center rounded-xl ${colorClasses.bg} ${colorClasses.border}`}
				>
					<Icon className={`h-7 w-7 ${colorClasses.text}`} />
				</div>
				<p className="font-black text-4xl tracking-tight">{value}</p>
				<p className="font-bold text-muted-foreground text-xs tracking-[0.15em]">
					{label}
				</p>
			</div>

			<div className="absolute -right-1 -bottom-1 h-8 w-8 rounded-br-xl border-primary/30 border-r-2 border-b-2 opacity-0 transition-opacity group-hover:opacity-100" />
		</div>
	);
}

export function Hero({
	totalGames,
	totalGenres,
	totalTags,
	totalDevelopers,
}: HeroProps) {
	const stats = [
		{
			label: "SPIELE GESAMT",
			value: totalGames.toString(),
			icon: Gamepad2,
			colorClasses: {
				bg: "bg-neon-cyan/10",
				border: "border border-neon-cyan/20",
				text: "text-neon-cyan",
			},
		},
		{
			label: "GENRES",
			value: totalGenres.toString(),
			icon: Database,
			colorClasses: {
				bg: "bg-neon-pink/10",
				border: "border border-neon-pink/20",
				text: "text-neon-pink",
			},
		},
		{
			label: "EINZIGARTIGE TAGS",
			value: totalTags.toString(),
			icon: Tag,
			colorClasses: {
				bg: "bg-neon-yellow/10",
				border: "border border-neon-yellow/20",
				text: "text-neon-yellow",
			},
		},
		{
			label: "ENTWICKLER",
			value: totalDevelopers.toString(),
			icon: Users,
			colorClasses: {
				bg: "bg-neon-orange/10",
				border: "border border-neon-orange/20",
				text: "text-neon-orange",
			},
		},
	];

	return (
		<section className="relative flex min-h-[90vh] items-center overflow-hidden">
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.7_0.2_180_/_0.03)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.7_0.2_180_/_0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

				<div className="absolute top-1/4 left-1/4 h-[500px] w-[500px] animate-pulse-glow rounded-full bg-primary/10 blur-[120px]" />
				<div
					className="absolute right-1/4 bottom-1/4 h-[400px] w-[400px] animate-pulse-glow rounded-full bg-accent/10 blur-[100px]"
					style={{ animationDelay: "1s" }}
				/>
				<div
					className="absolute top-1/2 right-1/3 h-[300px] w-[300px] animate-pulse-glow rounded-full bg-chart-3/10 blur-[80px]"
					style={{ animationDelay: "0.5s" }}
				/>

				<div className="absolute top-0 left-1/4 h-full w-px bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
				<div className="absolute top-0 right-1/4 h-full w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent" />
			</div>

			<div className="mx-auto max-w-7xl px-6 py-20">
				<div className="flex flex-col items-center text-center">
					<h1 className="font-black text-5xl tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
						<span className="block text-foreground text-[#C0C0C0]">STEAM</span>
						<span className="mt-2 block text-glow-[#87FF00] text-[#87FF00]">
							ENGINE
						</span>
					</h1>

					<p className="mx-auto mt-8 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl">
						Entdecke{" "}
						<span className="font-semibold text-neon-cyan">
							{totalGames}+ Spiele
						</span>{" "}
						mit detaillierten Infos zu Genres, Tags, Preisen,
						Entwicklern und Analysen.
					</p>

					<div className="mt-12 flex flex-col items-center gap-4 sm:flex-row">
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
							className="h-14 border-neon-pink/50 bg-transparent px-10 font-bold text-base text-neon-pink tracking-wider transition-all duration-300 hover:scale-105 hover:border-neon-pink hover:bg-neon-pink/10"
							render={(props) => (
								<a {...props} href="#statistics">
									<TrendingUp className="mr-2 h-5 w-5" />
									STATISTIKEN ANSEHEN
								</a>
							)}
						/>
					</div>

					<div className="mt-24 grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
						{stats.map((stat) => (
							<StatCard
								key={stat.label}
								label={stat.label}
								value={stat.value}
								icon={stat.icon}
								colorClasses={stat.colorClasses}
							/>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
