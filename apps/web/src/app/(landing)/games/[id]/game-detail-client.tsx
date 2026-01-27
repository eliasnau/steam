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
};

interface GameDetailClientProps {
	game: GameData;
}

export function GameDetailClient({ game }: GameDetailClientProps) {
	const totalReviews = game.positiveReviews + game.negativeReviews;
	const ratingPercentage =
		totalReviews > 0
			? Math.round((game.positiveReviews / totalReviews) * 100)
			: 0;
	const price = game.price ? Number(game.price) : 0;

	return (
		<main className="min-h-screen">
			{/* Hero Section */}
			<div className="relative overflow-hidden border-neon-cyan/10 border-b bg-secondary/30">
				{/* Background Image */}
				{game.image && (
					<div className="absolute inset-0 -z-10">
						<img
							src={game.image}
							alt={game.name}
							className="h-full w-full object-cover opacity-20 blur-xl"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
					</div>
				)}

				<div className="mx-auto max-w-7xl px-6 py-12">
					{/* Back Button */}
					<Link href="/#games">
						<Button
							variant="ghost"
							className="mb-6 gap-2 text-neon-cyan hover:bg-neon-cyan/10 hover:text-neon-cyan"
						>
							<ArrowLeft className="h-4 w-4" />
							<span className="font-bold tracking-wider">
								ZURÜCK ZUR ÜBERSICHT
							</span>
						</Button>
					</Link>

					<div className="flex flex-col gap-8 lg:flex-row lg:items-start">
						{/* Game Image */}
						<div className="flex-shrink-0">
							{game.image ? (
								<div className="glow-cyan overflow-hidden rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 shadow-2xl">
									<img
										src={game.image}
										alt={game.name}
										className="h-auto w-full lg:w-[460px]"
									/>
								</div>
							) : (
								<div className="flex h-[215px] w-full items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/5 lg:w-[460px]">
									<Gamepad2 className="h-24 w-24 text-neon-cyan/30" />
								</div>
							)}
						</div>

						{/* Game Info */}
						<div className="flex-1">
							<h1 className="mb-4 font-black text-5xl text-glow-cyan text-neon-cyan tracking-tight">
								{game.name}
							</h1>

							{game.shortDescription && (
								<p className="mb-6 text-lg text-muted-foreground leading-relaxed">
									{game.shortDescription}
								</p>
							)}

							{/* Key Stats */}
							<div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
								{/* Rating */}
								<div className="rounded-xl border border-neon-yellow/20 bg-neon-yellow/5 p-4">
									<div className="mb-2 flex items-center gap-2 text-neon-yellow">
										<Star className="h-5 w-5 fill-neon-yellow" />
										<span className="font-bold text-xs tracking-wider">
											BEWERTUNG
										</span>
									</div>
									<p className="font-black text-2xl text-neon-yellow">
										{totalReviews > 0 ? `${ratingPercentage}%` : "—"}
									</p>
									<p className="text-muted-foreground text-xs">
										{totalReviews.toLocaleString()} Reviews
									</p>
								</div>

								{/* Price */}
								<div className="rounded-xl border border-neon-cyan/20 bg-neon-cyan/5 p-4">
									<div className="mb-2 flex items-center gap-2 text-neon-cyan">
										<DollarSign className="h-5 w-5" />
										<span className="font-bold text-xs tracking-wider">
											PREIS
										</span>
									</div>
									{price === 0 ? (
										<p className="font-black text-2xl text-neon-cyan">FREE</p>
									) : (
										<p className="font-black text-2xl text-foreground">
											${price.toFixed(2)}
										</p>
									)}
								</div>

								{/* Release Date */}
								<div className="rounded-xl border border-neon-pink/20 bg-neon-pink/5 p-4">
									<div className="mb-2 flex items-center gap-2 text-neon-pink">
										<Calendar className="h-5 w-5" />
										<span className="font-bold text-xs tracking-wider">
											RELEASE
										</span>
									</div>
									<p className="font-black text-foreground text-lg">
										{new Date(game.releasedAt).toLocaleDateString("de-DE", {
											year: "numeric",
											month: "short",
											day: "numeric",
										})}
									</p>
								</div>

								{/* Steam ID */}
								<div className="rounded-xl border border-neon-purple/20 bg-neon-purple/5 p-4">
									<div className="mb-2 flex items-center gap-2 text-neon-purple">
										<Gamepad2 className="h-5 w-5" />
										<span className="font-bold text-xs tracking-wider">
											STEAM ID
										</span>
									</div>
									<p className="font-black text-foreground text-lg">
										{game.steamId}
									</p>
								</div>
							</div>

							{/* Website Link */}
							{game.website && (
								<a
									href={game.website}
									target="_blank"
									rel="noopener noreferrer"
									className="inline-flex items-center gap-2 rounded-xl border border-neon-cyan/30 bg-neon-cyan/10 px-6 py-3 font-bold text-neon-cyan tracking-wider transition-all hover:border-neon-cyan/50 hover:bg-neon-cyan/20"
								>
									<Globe className="h-5 w-5" />
									WEBSITE BESUCHEN
								</a>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Details Section */}
			<div className="mx-auto max-w-7xl px-6 py-12">
				<div className="grid gap-8 lg:grid-cols-2">
					{/* Reviews Breakdown */}
					<div className="rounded-2xl border border-neon-cyan/20 bg-card/50 p-6 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10">
								<Star className="h-6 w-6 text-neon-cyan" />
							</div>
							<h2 className="font-black text-2xl text-neon-cyan">
								BEWERTUNGEN
							</h2>
						</div>

						<div className="space-y-4">
							{/* Positive Reviews */}
							<div className="flex items-center justify-between rounded-lg border border-neon-cyan/10 bg-neon-cyan/5 p-4">
								<div className="flex items-center gap-3">
									<ThumbsUp className="h-5 w-5 text-neon-cyan" />
									<span className="font-bold text-foreground">Positiv</span>
								</div>
								<span className="font-black text-2xl text-neon-cyan">
									{game.positiveReviews.toLocaleString()}
								</span>
							</div>

							{/* Negative Reviews */}
							<div className="flex items-center justify-between rounded-lg border border-neon-pink/10 bg-neon-pink/5 p-4">
								<div className="flex items-center gap-3">
									<ThumbsDown className="h-5 w-5 text-neon-pink" />
									<span className="font-bold text-foreground">Negativ</span>
								</div>
								<span className="font-black text-2xl text-neon-pink">
									{game.negativeReviews.toLocaleString()}
								</span>
							</div>

							{/* Total */}
							<div className="flex items-center justify-between rounded-lg border border-neon-yellow/10 bg-neon-yellow/5 p-4">
								<span className="font-bold text-foreground">Gesamt</span>
								<span className="font-black text-2xl text-neon-yellow">
									{totalReviews.toLocaleString()}
								</span>
							</div>
						</div>
					</div>

					{/* Developers */}
					<div className="rounded-2xl border border-neon-cyan/20 bg-card/50 p-6 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon-orange/30 bg-neon-orange/10">
								<Users className="h-6 w-6 text-neon-orange" />
							</div>
							<h2 className="font-black text-2xl text-neon-orange">
								ENTWICKLER
							</h2>
						</div>

						{game.developers.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{game.developers.map((dev) => (
									<Badge
										key={dev.developer.id}
										className="border-neon-orange/20 bg-neon-orange/10 px-4 py-2 font-bold text-neon-orange text-sm hover:bg-neon-orange/20"
									>
										{dev.developer.name}
									</Badge>
								))}
							</div>
						) : (
							<p className="text-muted-foreground">
								Keine Entwickler angegeben
							</p>
						)}
					</div>

					{/* Genres */}
					<div className="rounded-2xl border border-neon-cyan/20 bg-card/50 p-6 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon-pink/30 bg-neon-pink/10">
								<Layers className="h-6 w-6 text-neon-pink" />
							</div>
							<h2 className="font-black text-2xl text-neon-pink">GENRES</h2>
						</div>

						{game.genres.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{game.genres.map((genreItem) => (
									<Badge
										key={genreItem.genre.id}
										className="border-neon-pink/20 bg-neon-pink/10 px-4 py-2 font-bold text-neon-pink text-sm hover:bg-neon-pink/20"
									>
										{genreItem.genre.name}
									</Badge>
								))}
							</div>
						) : (
							<p className="text-muted-foreground">Keine Genres angegeben</p>
						)}
					</div>

					{/* Tags */}
					<div className="rounded-2xl border border-neon-cyan/20 bg-card/50 p-6 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10">
								<Tag className="h-6 w-6 text-neon-cyan" />
							</div>
							<h2 className="font-black text-2xl text-neon-cyan">TAGS</h2>
						</div>

						{game.tags.length > 0 ? (
							<div className="flex flex-wrap gap-2">
								{game.tags.map((tagItem) => (
									<Badge
										key={tagItem.tag.id}
										variant="outline"
										className="border-neon-cyan/20 bg-neon-cyan/5 px-3 py-1.5 font-medium text-muted-foreground text-xs hover:bg-neon-cyan/10"
									>
										{tagItem.tag.name}
									</Badge>
								))}
							</div>
						) : (
							<p className="text-muted-foreground">Keine Tags angegeben</p>
						)}
					</div>
				</div>

				{/* Categories */}
				{game.categories.length > 0 && (
					<div className="mt-8 rounded-2xl border border-neon-cyan/20 bg-card/50 p-6 backdrop-blur-sm">
						<div className="mb-4 flex items-center gap-3">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-neon-purple/30 bg-neon-purple/10">
								<Layers className="h-6 w-6 text-neon-purple" />
							</div>
							<h2 className="font-black text-2xl text-neon-purple">FEATURES</h2>
						</div>

						<div className="flex flex-wrap gap-2">
							{game.categories.map((catItem) => (
								<Badge
									key={catItem.category.id}
									variant="outline"
									className="border-neon-purple/20 bg-neon-purple/5 px-3 py-1.5 font-medium text-muted-foreground text-xs hover:bg-neon-purple/10"
								>
									{catItem.category.name}
								</Badge>
							))}
						</div>
					</div>
				)}
			</div>
		</main>
	);
}
