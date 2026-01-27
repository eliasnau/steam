"use client";

import { useQuery } from "@tanstack/react-query";
import {
	ChevronDown,
	ChevronLeft,
	ChevronRight,
	Gamepad2,
	Search,
	SlidersHorizontal,
	Star,
	X,
} from "lucide-react";
import Link from "next/link";
import {
	parseAsArrayOf,
	parseAsInteger,
	parseAsString,
	useQueryStates,
} from "nuqs";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { orpc } from "@/utils/orpc";

const ITEMS_PER_PAGE = 8;

const priceRanges = [
	{ label: "Alle Preise", value: "all" },
	{ label: "Free to Play", value: "free" },
	{ label: "Unter $20", value: "under20" },
	{ label: "$20 - $40", value: "20to40" },
	{ label: "$40+", value: "over40" },
];

function CustomDropdown({
	value,
	onChange,
	options,
	placeholder,
}: {
	value: string;
	onChange: (value: string) => void;
	options: { label: string; value: string }[];
	placeholder: string;
}) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	const selectedOption = options.find((opt) => opt.value === value);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		}

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen]);

	return (
		<div ref={dropdownRef} className="relative">
			<button
				type="button"
				onClick={() => setIsOpen(!isOpen)}
				className="flex h-12 w-[160px] items-center justify-between rounded-xl border border-neon-cyan/20 bg-background/50 px-4 font-medium text-foreground text-sm transition-all hover:bg-background/70 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/30"
			>
				<span>{selectedOption?.label || placeholder}</span>
				<ChevronDown
					className={`h-4 w-4 text-neon-cyan/60 transition-transform ${
						isOpen ? "rotate-180" : ""
					}`}
				/>
			</button>

			{isOpen && (
				<div className="absolute z-[100] mt-2 w-[160px] overflow-hidden rounded-xl border border-neon-cyan/20 bg-card/95 shadow-lg backdrop-blur-sm">
					<div className="py-1">
						{options.map((option) => (
							<button
								key={option.value}
								type="button"
								onClick={() => {
									onChange(option.value);
									setIsOpen(false);
								}}
								className={`w-full px-4 py-2.5 text-left font-medium text-sm transition-colors ${
									option.value === value
										? "bg-neon-cyan/10 text-neon-cyan"
										: "text-foreground hover:bg-neon-cyan/5"
								}`}
							>
								{option.label}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
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
				priceRange: (priceRange as any) || undefined,
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
		<section
			id="games"
			className="dark relative border-primary/10 border-y bg-secondary/30"
		>
			<div className="absolute inset-0 -z-10">
				<div className="absolute top-0 right-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
				<div className="absolute right-0 bottom-0 left-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
			</div>

			<div className="mx-auto max-w-7xl px-6 py-20 lg:py-28">
				<div className="mb-12 flex flex-col items-center text-center">
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

				<div className="mb-10 rounded-2xl border border-neon-cyan/20 bg-card/50 p-6 backdrop-blur-sm">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center">
						<div className="relative flex-1">
							<Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-neon-cyan/60" />
							<input
								type="text"
								placeholder="Suche Spiele, Entwickler, Tags..."
								value={search}
								onChange={(e) =>
									setFilters({ search: e.target.value, page: 1 })
								}
								className="h-14 w-full rounded-xl border border-neon-cyan/20 bg-background/50 pr-4 pl-12 font-medium text-base text-foreground transition-all placeholder:text-muted-foreground/50 focus:border-neon-cyan/50 focus:outline-none focus:ring-2 focus:ring-neon-cyan/30"
							/>
						</div>

						<div className="flex flex-wrap items-center gap-3">
							<div className="flex items-center gap-2 text-neon-cyan">
								<SlidersHorizontal className="h-4 w-4" />
								<span className="font-bold text-xs tracking-wider">FILTER</span>
							</div>

							<CustomDropdown
								value={validGenreIds[0] || "all"}
								onChange={(v) => {
									setFilters({
										genreIds: v === "all" ? [] : [v],
										page: 1,
									});
								}}
								options={genreOptions}
								placeholder="Genre"
							/>

							<CustomDropdown
								value={priceRange}
								onChange={(v) => {
									setFilters({
										priceRange: v,
										page: 1,
									});
								}}
								options={priceRanges}
								placeholder="Preis"
							/>

							{hasActiveFilters && (
								<Button
									variant="ghost"
									size="sm"
									onClick={clearFilters}
									className="h-12 gap-2 text-neon-pink hover:bg-neon-pink/10 hover:text-neon-pink"
								>
									<X className="h-4 w-4" />
									<span className="font-bold text-xs tracking-wider">
										ZURÜCKSETZEN
									</span>
								</Button>
							)}
						</div>
					</div>

					<div className="mt-4 border-neon-cyan/10 border-t pt-4">
						<p className="text-muted-foreground text-sm">
							Zeige{" "}
							<span className="font-bold text-neon-cyan">
								{data?.data.length || 0}
							</span>{" "}
							von{" "}
							<span className="font-bold text-foreground">
								{data?.pagination.totalCount || 0}
							</span>{" "}
							Spielen
						</p>
					</div>
				</div>

				<div className="overflow-hidden rounded-2xl border border-neon-cyan/20 bg-card/30 backdrop-blur-sm">
					<Table>
						<TableHeader>
							<TableRow className="border-neon-cyan/20 bg-neon-cyan/5 hover:bg-neon-cyan/5">
								<TableHead className="h-16 pl-6 font-black text-neon-cyan text-xs tracking-wider">
									SPIEL
								</TableHead>
								<TableHead className="font-black text-neon-cyan text-xs tracking-wider">
									GENRE
								</TableHead>
								<TableHead className="hidden font-black text-neon-cyan text-xs tracking-wider md:table-cell">
									ENTWICKLER
								</TableHead>
								<TableHead className="hidden font-black text-neon-cyan text-xs tracking-wider lg:table-cell">
									TAGS
								</TableHead>
								<TableHead className="font-black text-neon-cyan text-xs tracking-wider">
									BEWERTUNG
								</TableHead>
								<TableHead className="pr-6 text-right font-black text-neon-cyan text-xs tracking-wider">
									PREIS
								</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{isPending ? (
								<TableRow>
									<TableCell colSpan={6} className="h-48 text-center">
										<div className="flex flex-col items-center gap-4 text-muted-foreground">
											<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5">
												<Gamepad2 className="h-8 w-8 animate-pulse text-neon-cyan/50" />
											</div>
											<p className="font-medium">Lade Spiele...</p>
										</div>
									</TableCell>
								</TableRow>
							) : !data?.data.length ? (
								<TableRow>
									<TableCell colSpan={6} className="h-48 text-center">
										<div className="flex flex-col items-center gap-4 text-muted-foreground">
											<div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-neon-cyan/20 bg-neon-cyan/5">
												<Search className="h-8 w-8 text-neon-cyan/50" />
											</div>
											<p className="font-medium">
												Keine Spiele gefunden, die deinen Kriterien entsprechen
											</p>
										</div>
									</TableCell>
								</TableRow>
							) : (
								data.data.map((game) => {
									const totalReviews =
										game.positiveReviews + game.negativeReviews;
									const ratingPercentage =
										totalReviews > 0
											? Math.round((game.positiveReviews / totalReviews) * 100)
											: 0;
									const price = game.price ? Number(game.price) : 0;

									return (
										<TableRow
											key={game.id}
											className="group cursor-pointer border-neon-cyan/10 transition-all duration-300 hover:bg-neon-cyan/5"
											onClick={() => {
												window.location.href = `/games/${game.id}`;
											}}
										>
											<TableCell className="pl-6">
												<div className="flex items-center gap-4">
													{game.image ? (
														<div className="h-16 w-28 flex-shrink-0 overflow-hidden rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 transition-all group-hover:border-neon-cyan/40">
															<img
																src={game.image}
																alt={game.name}
																className="h-full w-full object-cover"
															/>
														</div>
													) : (
														<div className="flex h-16 w-28 flex-shrink-0 items-center justify-center rounded-lg border border-neon-cyan/20 bg-neon-cyan/5 transition-all group-hover:border-neon-cyan/40">
															<Gamepad2 className="h-8 w-8 text-neon-cyan/30" />
														</div>
													)}
													<div className="flex flex-col">
														<span className="font-bold transition-colors group-hover:text-neon-cyan">
															{game.name}
														</span>
														<span className="text-muted-foreground text-xs">
															Steam ID: {game.steamId}
														</span>
													</div>
												</div>
											</TableCell>
											<TableCell>
												{game.genres.length > 0 ? (
													<Badge className="border-neon-pink/20 bg-neon-pink/10 font-bold text-neon-pink text-xs tracking-wide hover:bg-neon-pink/20">
														{game.genres[0].genre.name}
													</Badge>
												) : (
													<span className="text-muted-foreground text-xs">
														—
													</span>
												)}
											</TableCell>
											<TableCell className="hidden md:table-cell">
												<span className="text-muted-foreground text-sm">
													{game.developers && game.developers.length > 0
														? game.developers[0].developer.name
														: "—"}
												</span>
											</TableCell>
											<TableCell className="hidden lg:table-cell">
												<div className="flex flex-wrap gap-1.5">
													{game.tags && game.tags.length > 0 ? (
														<>
															{game.tags.slice(0, 2).map((tagItem: any) => (
																<Badge
																	key={tagItem.tag.id}
																	variant="outline"
																	className="border-neon-cyan/20 bg-neon-cyan/5 font-medium text-muted-foreground text-xs"
																>
																	{tagItem.tag.name}
																</Badge>
															))}
															{game.tags.length > 2 && (
																<Badge
																	variant="outline"
																	className="border-neon-cyan/20 bg-neon-cyan/5 font-medium text-neon-cyan text-xs"
																>
																	+{game.tags.length - 2}
																</Badge>
															)}
														</>
													) : (
														<span className="text-muted-foreground text-xs">
															—
														</span>
													)}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-2">
													<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neon-yellow/10">
														<Star className="h-4 w-4 fill-neon-yellow text-neon-yellow" />
													</div>
													<span className="font-black text-neon-yellow">
														{totalReviews > 0 ? `${ratingPercentage}%` : "—"}
													</span>
												</div>
											</TableCell>
											<TableCell className="pr-6 text-right">
												{price === 0 ? (
													<Badge className="glow-cyan border-neon-cyan/30 bg-neon-cyan/10 font-black text-neon-cyan tracking-wider">
														FREE
													</Badge>
												) : (
													<span className="font-black text-lg">
														${price.toFixed(2)}
													</span>
												)}
											</TableCell>
										</TableRow>
									);
								})
							)}
						</TableBody>
					</Table>
				</div>

				{totalPages > 1 && (
					<div className="mt-8 flex items-center justify-between">
						<p className="text-muted-foreground text-sm">
							Seite <span className="font-bold text-neon-cyan">{page}</span> von{" "}
							<span className="font-bold text-foreground">{totalPages}</span>
						</p>
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								onClick={() => setFilters({ page: Math.max(1, page - 1) })}
								disabled={page === 1}
								className="h-12 gap-2 border-neon-cyan/30 bg-neon-cyan/5 font-bold tracking-wider hover:border-neon-cyan/50 hover:bg-neon-cyan/10 disabled:opacity-30"
							>
								<ChevronLeft className="h-4 w-4" />
								ZURÜCK
							</Button>
							<Button
								variant="outline"
								onClick={() =>
									setFilters({ page: Math.min(totalPages, page + 1) })
								}
								disabled={page === totalPages}
								className="h-12 gap-2 border-neon-cyan/30 bg-neon-cyan/5 font-bold tracking-wider hover:border-neon-cyan/50 hover:bg-neon-cyan/10 disabled:opacity-30"
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
