"use client";

import {
	ArrowLeft,
	Calendar,
	Euro,
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
		cyan: "border-[#51A9F3]/35 bg-[#72F5F8]/14 text-[#51A9F3]",
		pink: "border-[#7800FF]/30 bg-[#7800FF]/10 text-[#7800FF]",
		yellow: "border-[#51A9F3]/25 bg-[#51A9F3]/10 text-[#51A9F3]",
		purple: "border-[#7800FF]/30 bg-[#7800FF]/10 text-[#7800FF]",
	};

	return (
		<div className="rounded-md border border-border bg-card/60 p-4 backdrop-blur-sm">
			<div className="mb-3 flex items-center gap-2">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-lg border ${accentStyles[accent]}`}
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
		cyan: "border-[#51A9F3]/35 bg-[#72F5F8]/14 text-[#51A9F3]",
		pink: "border-[#7800FF]/30 bg-[#7800FF]/10 text-[#7800FF]",
		orange: "border-[#51A9F3]/35 bg-[#72F5F8]/14 text-[#51A9F3]",
		purple: "border-[#7800FF]/30 bg-[#7800FF]/10 text-[#7800FF]",
	};

	return (
		<div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur-sm">
			<div className="mb-4 flex items-center gap-3 border-border/70 border-b pb-3 font-black text-xl tracking-wide">
				<div
					className={`flex h-10 w-10 items-center justify-center rounded-lg border ${accentStyles[accent]}`}
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
				<div className="absolute inset-0 bg-[linear-gradient(to_right,rgb(81_169_243_/_0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgb(81_169_243_/_0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
				<div className="absolute top-1/4 left-0 h-[520px] w-[520px] rounded-full bg-[#72F5F8]/12 blur-[140px]" />
				<div className="absolute right-0 bottom-1/4 h-[460px] w-[460px] rounded-full bg-[#7800FF]/10 blur-[140px]" />
			</div>

			<div className="mx-auto max-w-7xl px-6 pt-10 pb-14 lg:pt-14 lg:pb-20">
				<Link href="/#games">
					<Button
						variant="ghost"
						className="mb-8 gap-2 text-[#51A9F3] hover:bg-[#72F5F8]/15 hover:text-[#51A9F3]"
					>
						<ArrowLeft className="h-4 w-4" />
						<span className="font-bold text-xs tracking-[0.14em] uppercase">
							Zurück zur Übersicht
						</span>
					</Button>
				</Link>

				<section>
					<div className="grid gap-8 lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-10">
						<div>
							{game.image ? (
								<div className="overflow-hidden rounded-md border border-[#51A9F3]/25 bg-[#72F5F8]/8 shadow-xl shadow-[#51A9F3]/10">
									<img
										src={game.image}
										alt={game.name}
										className="h-auto w-full"
									/>
								</div>
							) : (
								<div className="flex min-h-[250px] items-center justify-center rounded-md border border-[#51A9F3]/25 bg-[#72F5F8]/8">
									<Gamepad2 className="h-16 w-16 text-[#51A9F3]/35" />
								</div>
							)}
						</div>

						<div className="min-w-0">
							<h1 className="font-black text-4xl text-foreground tracking-tight sm:text-5xl lg:text-6xl [font-family:var(--font-lemon-milk-bold)]">
								<span className="text-[#C0C0C0]">{titleStart}</span>
								{titleEnd ? (
									<span className="bg-linear-to-b from-[#51A9F3] to-[#72F5F8] bg-clip-text text-transparent">
										{" "}
										{titleEnd}
									</span>
								) : null}
							</h1>

							{game.shortDescription ? (
								<p className="mt-4 max-w-3xl text-base text-muted-foreground leading-relaxed md:text-lg">
									{game.shortDescription}
								</p>
							) : null}
						</div>
					</div>
				</section>

				<section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
					<StatTile
						icon={<Star className="h-4 w-4 fill-current" />}
						label="Bewertung"
						value={totalReviews > 0 ? `${ratingPercentage}%` : "—"}
						detail={`${totalReviews.toLocaleString()} Reviews`}
						accent="yellow"
					/>
					<StatTile
						icon={<Euro className="h-4 w-4" />}
						label="Preis"
						value={price === 0 ? "Kostenlos" : `€${price.toFixed(2)}`}
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
				</section>

				<section className="mt-4 flex flex-wrap items-center gap-5">
					{game.website ? (
						<a
							href={game.website}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-2 text-[#51A9F3] text-sm underline-offset-4 transition-colors hover:text-[#7800FF] hover:underline"
						>
							<Globe className="h-4 w-4" />
							Offizielle Website
						</a>
					) : null}
					<a
						href={`https://store.steampowered.com/app/${game.steamId}/`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 text-[#51A9F3] text-sm underline-offset-4 transition-colors hover:text-[#7800FF] hover:underline"
					>
						<Gamepad2 className="h-4 w-4" />
						Im Steam Store öffnen
					</a>
				</section>

				<section className="mt-8 grid gap-6 lg:grid-cols-2">
					<DetailCard
						title="Bewertungen"
						icon={<Star className="h-5 w-5" />}
						accent="cyan"
					>
						<div className="space-y-3">
							<div className="flex items-center justify-between rounded-md border border-[#51A9F3]/20 bg-[#72F5F8]/10 p-3">
								<div className="flex items-center gap-2 text-[#51A9F3]">
									<ThumbsUp className="h-4 w-4" />
									<span className="font-semibold">Positiv</span>
								</div>
								<span className="font-black text-xl text-[#51A9F3]">
									{game.positiveReviews.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-md border border-[#7800FF]/20 bg-[#7800FF]/8 p-3">
								<div className="flex items-center gap-2 text-[#7800FF]">
									<ThumbsDown className="h-4 w-4" />
									<span className="font-semibold">Negativ</span>
								</div>
								<span className="font-black text-xl text-[#7800FF]">
									{game.negativeReviews.toLocaleString()}
								</span>
							</div>
							<div className="flex items-center justify-between rounded-md border border-border/60 bg-secondary/20 p-3">
								<span className="font-semibold text-foreground">Gesamt</span>
								<span className="font-black text-xl text-foreground">
									{totalReviews.toLocaleString()}
								</span>
							</div>
						</div>
					</DetailCard>

					<div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#51A9F3]/35 bg-[#72F5F8]/14 text-[#51A9F3]">
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
												className="border-[#51A9F3]/25 bg-[#72F5F8]/12 px-3 py-1.5 font-semibold text-[#51A9F3] text-xs"
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
												className="border-[#7800FF]/25 bg-[#7800FF]/10 px-3 py-1.5 font-semibold text-[#7800FF] text-xs"
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

					<div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#7800FF]/30 bg-[#7800FF]/10 text-[#7800FF]">
								<Layers className="h-5 w-5" />
							</div>
							<h3 className="font-black text-xl tracking-wide">Genres</h3>
						</div>
						{game.genres.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{game.genres.map((genreItem) => (
									<Badge
										key={genreItem.genre.id}
										className="border-[#7800FF]/25 bg-[#7800FF]/10 px-3 py-1.5 font-semibold text-[#7800FF] text-xs"
									>
										{genreItem.genre.name}
									</Badge>
								))}
							</div>
						) : (
							<p className="text-muted-foreground text-sm">Keine Genres angegeben</p>
						)}
					</div>

					<div className="rounded-md border border-border bg-card/60 p-5 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#51A9F3]/35 bg-[#72F5F8]/14 text-[#51A9F3]">
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
										className="border-[#51A9F3]/25 bg-[#72F5F8]/10 px-3 py-1.5 font-medium text-[#51A9F3] text-xs"
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
										className="border-[#7800FF]/25 bg-[#7800FF]/10 px-3 py-1.5 font-medium text-[#7800FF] text-xs"
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
