"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ChevronLeft,
	ChevronRight,
	Gamepad2,
	Search,
	SlidersHorizontal,
	Star,
	X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryStates,
} from "nuqs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectItem,
	SelectPopup,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { orpc } from "@/utils/orpc";

const ITEMS_PER_PAGE = 8;

const priceRanges = [
	{ label: "Alle Preise", value: "all" },
	{ label: "Free to Play", value: "free" },
	{ label: "Unter $20", value: "under20" },
	{ label: "$20 - $40", value: "20to40" },
	{ label: "$40+", value: "over40" },
] as const;

type PriceRangeValue = (typeof priceRanges)[number]["value"];

function GameRow({
	game,
}: {
	game: {
		id: string;
		name: string;
		steamId: number;
		image: string | null;
		price: string | null;
		positiveReviews: number;
		negativeReviews: number;
		genres: Array<{ genre: { name: string } }>;
		developers: Array<{ developer: { name: string } }>;
		tags: Array<{ tag: { id: string; name: string } }>;
	};
}) {
	const router = useRouter();
	const totalReviews = game.positiveReviews + game.negativeReviews;
	const ratingPercentage =
		totalReviews > 0
			? Math.round((game.positiveReviews / totalReviews) * 100)
			: 0;
	const price = game.price ? Number(game.price) : 0;

	return (
		<a
			href={`/games/${game.id}`}
			className="group flex items-center gap-4 rounded-xl border border-border bg-secondary/30 p-3 transition-all duration-300 hover:border-primary/30 hover:bg-secondary/50"
			onClick={(e) => {
				e.preventDefault();
				router.push(`/games/${game.id}`);
			}}
		>
			{/* Thumbnail */}
			{game.image ? (
				<div className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-secondary/50 transition-all group-hover:border-primary/30">
					<img
						src={game.image}
						alt={game.name}
						className="h-full w-full object-cover"
					/>
				</div>
			) : (
				<div className="flex h-16 w-28 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-secondary/50 transition-all group-hover:border-primary/30">
					<Gamepad2 className="h-6 w-6 text-muted-foreground/40" />
				</div>
			)}

			{/* Name + Developer */}
			<div className="min-w-0 flex-1">
				<p className="truncate font-bold text-sm transition-colors group-hover:text-neon-cyan">
					{game.name}
				</p>
				<p className="mt-0.5 truncate text-muted-foreground text-xs">
					{game.developers?.length > 0
						? game.developers[0].developer.name
						: `Steam ID: ${game.steamId}`}
				</p>
			</div>

			{/* Genre */}
			<div className="hidden shrink-0 md:block">
				{game.genres.length > 0 ? (
					<Badge
						variant="outline"
						className="border-neon-pink/20 bg-neon-pink/5 font-bold text-neon-pink text-xs"
					>
						{game.genres[0].genre.name}
					</Badge>
				) : null}
			</div>

			{/* Tags */}
			<div className="hidden shrink-0 gap-1.5 lg:flex">
				{game.tags?.slice(0, 2).map((tagItem) => (
					<Badge
						key={tagItem.tag.id}
						variant="outline"
						className="border-border bg-secondary/50 font-medium text-muted-foreground text-xs"
					>
						{tagItem.tag.name}
					</Badge>
				))}
				{game.tags?.length > 2 && (
					<Badge
						variant="outline"
						className="border-border bg-secondary/50 font-medium text-muted-foreground text-xs"
					>
						+{game.tags.length - 2}
					</Badge>
				)}
			</div>

			{/* Rating */}
			<div className="flex shrink-0 items-center gap-1.5">
				<div className="flex h-7 w-7 items-center justify-center rounded-lg border border-neon-yellow/30 bg-neon-yellow/10">
					<Star className="h-3.5 w-3.5 fill-neon-yellow text-neon-yellow" />
				</div>
				<span className="font-black text-neon-yellow text-sm">
					{totalReviews > 0 ? `${ratingPercentage}%` : "—"}
				</span>
			</div>

			{/* Price */}
			<div className="w-20 shrink-0 text-right">
				{price === 0 ? (
					<Badge className="border-neon-cyan/30 bg-neon-cyan/10 font-black text-neon-cyan text-xs tracking-wider">
						FREE
					</Badge>
				) : (
					<span className="font-black text-sm">
						${price.toFixed(2)}
					</span>
				)}
			</div>
		</a>
	);
}

export function LandingGamesTable() {
	const [{ page, search, genreIds, priceRange }, setFilters] = useQueryStates({
		page: parseAsInteger.withDefault(1),
		search: parseAsString.withDefault(""),
		genreIds: parseAsArrayOf(parseAsString).withDefault([]),
		priceRange: parseAsString.withDefault("all"),
	});

	const validGenreIds: string[] =
		genreIds.length > 0
			? genreIds.filter(
					(id): id is string => id !== null && id.trim().length > 0,
				)
			: [];

	const { data, isPending } = useQuery(
		orpc.games.list.queryOptions({
			input: {
				page,
				limit: ITEMS_PER_PAGE,
				search: search || undefined,
				genreIds: validGenreIds.length > 0 ? validGenreIds : undefined,
				priceRange:
					priceRange !== "all"
						? (priceRange as PriceRangeValue)
						: undefined,
			},
		}),
	);

	const { data: genresData } = useQuery(
		orpc.genres.getAll.queryOptions({
			input: undefined,
		}),
	);

	const totalPages = data?.pagination.totalPages || 1;
	const hasActiveFilters =
		search || validGenreIds.length > 0 || priceRange !== "all";

	const clearFilters = () => {
		setFilters({
			search: "",
			genreIds: [],
			priceRange: "all",
			page: 1,
		});
	};

	const genreOptions = [
		{ label: "Alle Genres", value: "all" },
		...(genresData?.map((g) => ({ label: g.name, value: g.id })) || []),
	];

	return (
		<section id="games" className="relative bg-background">
			{/* Background - same as analytics */}
			<div className="absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-[linear-gradient(to_right,oklch(0.7_0.2_180_/_0.02)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.7_0.2_180_/_0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />
				<div className="absolute top-1/4 left-0 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[120px]" />
				<div className="absolute right-0 bottom-1/4 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px]" />
			</div>

			<div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
				{/* Section header - matches analytics style */}
				<div className="mb-16 flex flex-col items-center text-center">
					<div className="glow-cyan mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-cyan/30 bg-neon-cyan/10">
						<Gamepad2 className="h-8 w-8 text-neon-cyan" />
					</div>
					<h2 className="font-black text-4xl tracking-tight md:text-5xl">
						<span className="text-glow-cyan text-neon-cyan">GAMES</span>{" "}
						DATABASE
					</h2>
					<p className="mt-4 max-w-xl text-lg text-muted-foreground">
						Durchsuche und filtere unsere umfassende Spielesammlung
					</p>
				</div>

				{/* Filters - inside a Card like analytics */}
				<Card className="mb-8 border-border bg-card/50 backdrop-blur-sm">
					<CardHeader className="pb-2">
						<div className="flex items-center gap-3">
							<div className="flex h-10 w-10 items-center justify-center rounded-xl border border-neon-cyan/30 bg-neon-cyan/10">
								<SlidersHorizontal className="h-5 w-5 text-neon-cyan" />
							</div>
							<div>
								<CardTitle className="font-black text-lg tracking-wide">
									SPIELE DURCHSUCHEN
								</CardTitle>
								<CardDescription>
									{data ? (
										<>
											<span className="font-bold text-foreground">
												{data.pagination.totalCount}
											</span>{" "}
											Spiele gefunden
											{hasActiveFilters && " mit aktiven Filtern"}
										</>
									) : (
										"Lade Spieldaten..."
									)}
								</CardDescription>
							</div>
						</div>
					</CardHeader>
					<CardContent className="pt-4">
						<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
							{/* Search */}
							<div className="relative flex-1">
								<Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
								<input
									type="text"
									placeholder="Suche Spiele, Entwickler, Tags..."
									value={search}
									onChange={(e) =>
										setFilters({ search: e.target.value, page: 1 })
									}
									className="h-10 w-full rounded-xl border border-border bg-secondary/30 pr-4 pl-10 text-sm text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20"
								/>
							</div>

							{/* Filter dropdowns */}
							<div className="flex flex-wrap items-center gap-3">
								<Select
									items={genreOptions}
									value={validGenreIds[0] || "all"}
									onValueChange={(value) => {
										const v = String(value);
										setFilters({
											genreIds: v === "all" ? [] : [v],
											page: 1,
										});
									}}
								>
									<SelectTrigger
										aria-label="Genre auswählen"
										className="h-10 w-[160px] rounded-xl border-border bg-secondary/30 text-sm hover:bg-secondary/50"
									>
										<SelectValue placeholder="Genre" />
									</SelectTrigger>
									<SelectPopup>
										{genreOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectPopup>
								</Select>

								<Select
									items={priceRanges.map((range) => ({
										label: range.label,
										value: range.value,
									}))}
									value={priceRange}
									onValueChange={(value) => {
										setFilters({
											priceRange: String(value),
											page: 1,
										});
									}}
								>
									<SelectTrigger
										aria-label="Preisbereich auswählen"
										className="h-10 w-[160px] rounded-xl border-border bg-secondary/30 text-sm hover:bg-secondary/50"
									>
										<SelectValue placeholder="Preis" />
									</SelectTrigger>
									<SelectPopup>
										{priceRanges.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectPopup>
								</Select>

								{hasActiveFilters && (
									<Button
										variant="ghost"
										size="sm"
										onClick={clearFilters}
										className="h-10 gap-1.5 text-neon-pink hover:bg-neon-pink/10 hover:text-neon-pink"
									>
										<X className="h-3.5 w-3.5" />
										<span className="font-bold text-xs tracking-wider">
											ZURÜCKSETZEN
										</span>
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Game list - card-based rows instead of HTML table */}
				<div className="flex flex-col gap-3">
					{isPending ? (
						<Card className="border-border bg-card/50 backdrop-blur-sm">
							<CardContent className="flex flex-col items-center justify-center gap-4 py-16">
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5">
									<Gamepad2 className="h-8 w-8 animate-pulse text-neon-cyan/50" />
								</div>
								<p className="font-medium text-muted-foreground">
									Lade Spiele...
								</p>
							</CardContent>
						</Card>
					) : !data?.data.length ? (
						<Card className="border-border bg-card/50 backdrop-blur-sm">
							<CardContent className="flex flex-col items-center justify-center gap-4 py-16">
								<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5">
									<Search className="h-8 w-8 text-neon-cyan/50" />
								</div>
								<p className="font-medium text-muted-foreground">
									Keine Spiele gefunden, die deinen Kriterien entsprechen
								</p>
								{hasActiveFilters && (
									<Button
										variant="outline"
										size="sm"
										onClick={clearFilters}
										className="mt-2"
									>
										Filter zurücksetzen
									</Button>
								)}
							</CardContent>
						</Card>
					) : (
						data.data.map((game) => (
							<GameRow key={game.id} game={game} />
						))
					)}
				</div>

				{/* Pagination */}
				{totalPages > 1 && (
					<div className="mt-8 flex items-center justify-between">
						<p className="text-muted-foreground text-sm">
							Seite{" "}
							<span className="font-bold text-foreground">{page}</span> von{" "}
							<span className="font-bold text-foreground">{totalPages}</span>
						</p>
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setFilters({ page: Math.max(1, page - 1) })}
								disabled={page === 1}
								className="h-10 gap-2 font-bold tracking-wider disabled:opacity-30"
							>
								<ChevronLeft className="h-4 w-4" />
								ZURÜCK
							</Button>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									setFilters({ page: Math.min(totalPages, page + 1) })
								}
								disabled={page === totalPages}
								className="h-10 gap-2 font-bold tracking-wider disabled:opacity-30"
							>
								WEITER
								<ChevronRight className="h-4 w-4" />
							</Button>
						</div>
					</div>
				)}
			</div>
		</section>
	);
}
