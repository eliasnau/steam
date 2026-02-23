"use client";

import {
	ArrowLeft,
	Calendar,
	DollarSign,
	Gamepad2,
	Globe,
	Layers,
	Star,
	Tag,
	ThumbsDown,
	ThumbsUp,
	Users,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type GameData = {
	id: string;
	steamId: number;
	name: string;
	price: string | null;
	releasedAt: string;
	positiveReviews: number;
	negativeReviews: number;
	image: string | null;
	shortDescription: string | null;
	website: string | null;
	genres: Array<{ genreId: string; genre: { id: string; name: string } }>;
	tags: Array<{ tagId: string; tag: { id: string; name: string } }>;
	categories: Array<{
		categoryId: string;
		category: { id: string; name: string };
	}>;
	developers: Array<{
		developerId: string;
		developer: { id: string; name: string };
	}>;
	publishers: Array<{
		publisherId: string;
		publisher: { id: string; name: string };
	}>;
};

interface GameDetailClientProps {
	game: GameData;
}

function StatTile({
	icon,
	label,
	value,
	detail,
	accent,
}: {
	icon: ReactNode;
	label: string;
	value: string;
	detail?: string;
	accent: "cyan" | "pink" | "yellow" | "purple";
}) {
	const accentStyles = {
		cyan: "border-neon-cyan/25 bg-neon-cyan/8 text-neon-cyan",
		pink: "border-neon-pink/25 bg-neon-pink/8 text-neon-pink",
		yellow: "border-neon-yellow/25 bg-neon-yellow/8 text-neon-yellow",
		purple: "border-neon-purple/25 bg-neon-purple/8 text-neon-purple",
	};

	return (
		<div className="rounded-none border border-border bg-card/50 p-4 backdrop-blur-sm">
			<div className="mb-3 flex items-center gap-2">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${accentStyles[accent]}`}
				>
					{icon}
				</div>
				<span className="font-bold text-[11px] text-muted-foreground tracking-[0.18em] uppercase">
					{label}
				</span>
			</div>
			<p className="font-black text-2xl text-foreground tracking-tight">{value}</p>
			{detail ? (
				<p className="mt-1 text-muted-foreground text-xs tracking-wide">{detail}</p>
			) : null}
		</div>
	);
}

function DetailCard({
	title,
	icon,
	accent,
	children,
}: {
	title: string;
	icon: ReactNode;
	accent: "cyan" | "pink" | "orange" | "purple";
	children: React.ReactNode;
}) {
	const accentStyles = {
		cyan: "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan",
		pink: "border-neon-pink/30 bg-neon-pink/10 text-neon-pink",
		orange: "border-neon-orange/30 bg-neon-orange/10 text-neon-orange",
		purple: "border-neon-purple/30 bg-neon-purple/10 text-neon-purple",
	};

	return (
		<div className="rounded-none border border-border bg-card/50 p-5 backdrop-blur-sm">
			<div className="mb-4 flex items-center gap-3 font-black text-xl tracking-wide">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-2xl border ${accentStyles[accent]}`}
				>
					{icon}
				</div>
				<span>{title}</span>
			</div>
			{children}
		</div>
	);
}

export function GameDetailClient({ game }: GameDetailClientProps) {
	const totalReviews = game.positiveReviews + game.negativeReviews;
	const ratingPercentage =
		totalReviews > 0
			? Math.round((game.positiveReviews / totalReviews) * 100)
			: 0;
	const price = game.price ? Number(game.price) : 0;
	const formattedRelease = new Date(game.releasedAt).toLocaleDateString("de-DE", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
	const [titleStart, ...titleRest] = game.name.split(" ");
	const titleEnd = titleRest.join(" ");

	return (
		<main className="relative min-h-screen overflow-hidden bg-background">
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.7_0.2_180_/_0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.7_0.2_180_/_0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
				<div className="absolute top-1/4 left-0 h-[520px] w-[520px] rounded-full bg-neon-cyan/8 blur-[140px]" />
				<div className="absolute right-0 bottom-1/4 h-[460px] w-[460px] rounded-full bg-neon-pink/8 blur-[140px]" />
			</div>

			<div className="mx-auto max-w-7xl px-6 pt-10 pb-14 lg:pt-14 lg:pb-20">
				<Link href="/#games">
					<Button
						variant="ghost"
						className="mb-8 gap-2 text-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="font-bold text-xs tracking-[0.14em] uppercase">
							Zurück zur Übersicht
						</span>
					</Button>
				</Link>

				<section className="p-1 md:p-2">
					<div className="grid gap-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-10">
						<div>
							{game.image ? (
								<div className="overflow-hidden rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 shadow-2xl shadow-neon-cyan/10">
									<img
										src={game.image}
										alt={game.name}
										className="h-auto w-full"
									/>
								</div>
							) : (
								<div className="flex min-h-[250px] items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5">
									<Gamepad2 className="h-16 w-16 text-neon-cyan/35" />
								</div>
							)}
						</div>

						<div className="min-w-0">
							<h1 className="font-black text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl">
								<span className="text-[#C0C0C0]">{titleStart}</span>
								{titleEnd ? <span className="text-neon-cyan"> {titleEnd}</span> : null}
							</h1>

							{game.shortDescription ? (
								<p className="mt-4 max-w-3xl text-base text-muted-foreground leading-relaxed md:text-lg">
									{game.shortDescription}
								</p>
							) : null}

							<div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
								<StatTile
									icon={<Star className="h-4 w-4 fill-current" />}
									label="Bewertung"
									value={totalReviews > 0 ? `${ratingPercentage}%` : "—"}
									detail={`${totalReviews.toLocaleString()} Reviews`}
									accent="yellow"
								/>
								<StatTile
									icon={<DollarSign className="h-4 w-4" />}
									label="Preis"
									value={price === 0 ? "Kostenlos" : `$${price.toFixed(2)}`}
									accent="cyan"
								/>
								<StatTile
									icon={<Calendar className="h-4 w-4" />}
									label="Release"
									value={formattedRelease}
									accent="pink"
								/>
								<StatTile
									icon={<Gamepad2 className="h-4 w-4" />}
									label="Steam ID"
									value={String(game.steamId)}
									accent="purple"
								/>
							</div>

							{game.website ? (
								<div className="mt-6">
									<a
										href={game.website}
										target="_blank"
										rel="noopener noreferrer"
											className="inline-flex items-center gap-2 rounded-xl border border-neon-cyan/35 bg-neon-cyan/12 px-5 py-3 font-bold text-neon-cyan text-sm tracking-[0.1em] uppercase transition-all hover:border-neon-cyan/60 hover:bg-neon-cyan/20"
									>
										<Globe className="h-4 w-4" />
										Website besuchen
									</a>
								</div>
							) : null}
						</div>
					</div>
				</section>

				<section className="mt-8 grid gap-6 lg:grid-cols-2">
					<DetailCard
						title="Bewertungen"
						icon={<Star className="h-5 w-5" />}
						accent="cyan"
					>
						<div className="space-y-3">
							<div className="flex items-center justify-between rounded-xl border border-neon-cyan/20 bg-neon-cyan/8 p-3">
								<div className="flex items-center gap-2 text-neon-cyan">
									<ThumbsUp className="h-4 w-4" />
									<span className="font-semibold">Positiv</span>
								</div>
								<span className="font-black text-xl text-neon-cyan">
									{game.positiveReviews.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-xl border border-neon-pink/20 bg-neon-pink/8 p-3">
								<div className="flex items-center gap-2 text-neon-pink">
									<ThumbsDown className="h-4 w-4" />
									<span className="font-semibold">Negativ</span>
								</div>
								<span className="font-black text-xl text-neon-pink">
									{game.negativeReviews.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-xl border border-neon-yellow/20 bg-neon-yellow/8 p-3">
								<span className="font-semibold text-foreground">Gesamt</span>
								<span className="font-black text-xl text-neon-yellow">
									{totalReviews.toLocaleString()}
								</span>
							</div>
						</div>
					</DetailCard>

					<div className="rounded-none border border-border bg-card/50 p-5 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-orange/30 bg-neon-orange/10 text-neon-orange">
								<Users className="h-5 w-5" />
							</div>
							<h3 className="font-black text-xl tracking-wide">
								Entwickler & Publisher
							</h3>
						</div>
						<div className="space-y-4">
							<div>
								<p className="mb-2 font-bold text-[11px] text-muted-foreground tracking-[0.16em] uppercase">
									Entwickler
								</p>
								{game.developers.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{game.developers.map((dev) => (
											<Badge
												key={dev.developer.id}
												className="border-neon-orange/25 bg-neon-orange/12 px-3 py-1.5 font-semibold text-neon-orange text-xs"
											>
												{dev.developer.name}
											</Badge>
										))}
									</div>
								) : (
									<p className="text-muted-foreground text-sm">
										Keine Entwickler angegeben
									</p>
								)}
							</div>
							<div>
								<p className="mb-2 font-bold text-[11px] text-muted-foreground tracking-[0.16em] uppercase">
									Publisher
								</p>
								{game.publishers.length > 0 ? (
									<div className="flex flex-wrap gap-2">
										{game.publishers.map((publisherItem) => (
											<Badge
												key={publisherItem.publisher.id}
												className="border-neon-cyan/25 bg-neon-cyan/12 px-3 py-1.5 font-semibold text-neon-cyan text-xs"
											>
												{publisherItem.publisher.name}
											</Badge>
										))}
									</div>
								) : (
									<p className="text-muted-foreground text-sm">
										Keine Publisher angegeben
									</p>
								)}
							</div>
						</div>
					</div>

					<div className="rounded-none border border-border bg-card/50 p-5 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-pink/30 bg-neon-pink/10 text-neon-pink">
								<Layers className="h-5 w-5" />
							</div>
							<h3 className="font-black text-xl tracking-wide">Genres</h3>
						</div>
						{game.genres.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{game.genres.map((genreItem) => (
									<Badge
										key={genreItem.genre.id}
										className="border-neon-pink/25 bg-neon-pink/12 px-3 py-1.5 font-semibold text-neon-pink text-xs"
									>
										{genreItem.genre.name}
									</Badge>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-sm">Keine Genres angegeben</p>
						)}
					</div>

					<div className="rounded-none border border-border bg-card/50 p-5 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan">
								<Tag className="h-5 w-5" />
							</div>
							<h3 className="font-black text-xl tracking-wide">Tags</h3>
						</div>
						{game.tags.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{game.tags.map((tagItem) => (
									<Badge
										key={tagItem.tag.id}
										variant="outline"
										className="border-neon-cyan/25 bg-neon-cyan/8 px-3 py-1.5 font-medium text-neon-cyan text-xs"
									>
										{tagItem.tag.name}
									</Badge>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-sm">Keine Tags angegeben</p>
						)}
					</div>
				</section>

				{game.categories.length > 0 ? (
					<section className="mt-6">
						<DetailCard
							title="Features"
							icon={<Layers className="h-5 w-5" />}
							accent="purple"
						>
							<div className="flex flex-wrap gap-2">
								{game.categories.map((catItem) => (
									<Badge
										key={catItem.category.id}
										variant="outline"
										className="border-neon-purple/25 bg-neon-purple/10 px-3 py-1.5 font-medium text-neon-purple text-xs"
									>
										{catItem.category.name}
									</Badge>
								))}
							</div>
						</DetailCard>
					</section>
				) : null}
			</div>
		</main>
	);
}
