"use client";

import { useQuery } from "@tanstack/react-query";
import {
	AlertCircle,
	ArrowLeft,
	Calendar,
	GamepadIcon,
	Star,
} from "lucide-react";
import Link from "next/link";
import { Suspense, use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Frame, FramePanel } from "@/components/ui/frame";
import { Skeleton } from "@/components/ui/skeleton";
import { orpc } from "@/utils/orpc";
import {
	Header,
	HeaderActions,
	HeaderContent,
	HeaderDescription,
	HeaderTitle,
} from "../../_components/page-header";

interface GameDetailsPageProps {
	params: Promise<{
		id: string;
	}>;
}

function GameDetailsContent({ params }: GameDetailsPageProps) {
	const { id } = use(params);

	const {
		data: game,
		isPending,
		error,
	} = useQuery(
		orpc.games.getById.queryOptions({
			input: { id: id },
		}),
	);

	if (error) {
		return (
			<div className="container mx-auto">
				<Header className="mb-4">
					<HeaderContent>
						<div className="flex items-center gap-2">
							<Link href="/admin/games">
								<Button variant="ghost" size="sm">
									<ArrowLeft className="h-4 w-4" />
								</Button>
							</Link>
							<HeaderTitle>Fehler</HeaderTitle>
						</div>
					</HeaderContent>
				</Header>
				<Frame>
					<FramePanel>
						<Empty>
							<EmptyHeader>
								<EmptyMedia variant="icon">
									<AlertCircle />
								</EmptyMedia>
								<EmptyTitle>Fehler beim Laden des Spiels</EmptyTitle>
								<EmptyDescription>
									{error instanceof Error
										? error.message
										: "Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut."}
								</EmptyDescription>
							</EmptyHeader>
						</Empty>
					</FramePanel>
				</Frame>
			</div>
		);
	}

	return (
		<div className="container mx-auto">
			<Header className="mb-4">
				<HeaderContent>
					<div className="flex items-center gap-2">
						<Link href="/admin/games">
							<Button variant="ghost" size="sm">
								<ArrowLeft className="h-4 w-4" />
							</Button>
						</Link>
						<div>
							<HeaderTitle>
								{isPending ? (
									<Skeleton className="h-8 w-64" />
								) : (
									game?.name || "Spiel"
								)}
							</HeaderTitle>
							<HeaderDescription>Details zum Spiel</HeaderDescription>
						</div>
					</div>
				</HeaderContent>
				<HeaderActions>
					<Button variant="outline">Bearbeiten</Button>
					<Button variant="destructive">Löschen</Button>
				</HeaderActions>
			</Header>

			<div className="space-y-4">
				<Frame>
					<FramePanel className="p-6">
						{isPending ? (
							<div className="flex flex-col gap-6 lg:flex-row">
								<Skeleton className="aspect-video w-full rounded-lg lg:w-1/3" />
								<div className="flex-1 space-y-3">
									<Skeleton className="h-8 w-3/4" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-2/3" />
								</div>
							</div>
						) : game ? (
							<div className="flex flex-col gap-6 lg:flex-row">
								<div className="w-full lg:w-1/3">
									{game.image ? (
										<div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
											<img
												src={game.image}
												alt={game.name}
												className="h-full w-full object-contain"
											/>
										</div>
									) : (
										<div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
											<GamepadIcon className="h-24 w-24 text-muted-foreground" />
										</div>
									)}
								</div>

								<div className="flex-1 space-y-4">
									<div>
										<h2 className="mb-2 font-bold text-3xl">{game.name}</h2>
										{game.shortDescription && (
											<p className="text-muted-foreground">
												{game.shortDescription}
											</p>
										)}
									</div>

									{game.tags && game.tags.length > 0 && (
										<div>
											<h3 className="mb-2 font-semibold text-muted-foreground text-sm">
												Tags
											</h3>
											<div className="flex flex-wrap gap-2">
												{game.tags.map((t: any) => (
													<Badge
														key={t.tagId}
														variant="outline"
														className="px-3 py-1"
													>
														{t.tag.name}
													</Badge>
												))}
											</div>
										</div>
									)}
								</div>
							</div>
						) : (
							<div className="py-12 text-center text-muted-foreground">
								Keine Daten verfügbar
							</div>
						)}
					</FramePanel>
				</Frame>

				<div className="grid gap-4 md:grid-cols-2">
					<Frame>
						<FramePanel className="p-6">
							<h3 className="mb-4 font-semibold text-lg">Grundinformationen</h3>
							<div className="space-y-3">
								{isPending ? (
									<>
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
									</>
								) : game ? (
									<>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Steam ID:</span>
											<span className="font-medium">{game.steamId}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Preis:</span>
											<span className="font-medium">
												{game.price
													? `${Number.parseFloat(game.price).toFixed(2)} €`
													: "Kostenlos"}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Veröffentlicht:
											</span>
											<span className="flex items-center gap-1 font-medium">
												<Calendar className="h-4 w-4" />
												{new Date(game.releasedAt).toLocaleDateString("de-DE")}
											</span>
										</div>
										{game.website && (
											<div className="flex justify-between gap-2">
												<span className="text-muted-foreground">Website:</span>
												<a
													href={game.website}
													target="_blank"
													rel="noopener noreferrer"
													className="truncate font-medium text-primary hover:underline"
												>
													{game.website}
												</a>
											</div>
										)}
									</>
								) : null}
							</div>
						</FramePanel>
					</Frame>

					<Frame>
						<FramePanel className="p-6">
							<h3 className="mb-4 font-semibold text-lg">Bewertungen</h3>
							<div className="space-y-4">
								{isPending ? (
									<>
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-8 w-24" />
									</>
								) : game ? (
									<>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Positiv:</span>
											<span className="font-medium text-green-600">
												{game.positiveReviews.toLocaleString()}
											</span>
										</div>
										<div className="flex justify-between">
											<span className="text-muted-foreground">Negativ:</span>
											<span className="font-medium text-red-600">
												{game.negativeReviews.toLocaleString()}
											</span>
										</div>
										{(() => {
											const total = game.positiveReviews + game.negativeReviews;
											const percentage =
												total > 0
													? Math.round((game.positiveReviews / total) * 100)
													: 0;
											return (
												<div className="pt-2">
													<div className="flex items-center gap-2">
														<Star
															className={`h-5 w-5 ${
																percentage >= 70
																	? "text-green-600"
																	: percentage >= 40
																		? "text-yellow-600"
																		: "text-red-600"
															}`}
														/>
														<span className="font-bold text-2xl">
															{percentage}%
														</span>
													</div>
													<p className="mt-1 text-muted-foreground text-sm">
														{total.toLocaleString()} Bewertungen insgesamt
													</p>
												</div>
											);
										})()}
									</>
								) : null}
							</div>
						</FramePanel>
					</Frame>
				</div>

				{game?.genres && game.genres.length > 0 && (
					<Frame>
						<FramePanel className="p-6">
							<h3 className="mb-4 font-semibold text-lg">Genres</h3>
							<div className="flex flex-wrap gap-2">
								{game.genres.map((g: any) => (
									<Badge
										key={g.genreId}
										variant="secondary"
										className="px-3 py-1"
									>
										{g.genre.name}
									</Badge>
								))}
							</div>
						</FramePanel>
					</Frame>
				)}

				{game?.categories && game.categories.length > 0 && (
					<Frame>
						<FramePanel className="p-6">
							<h3 className="mb-4 font-semibold text-lg">Kategorien</h3>
							<div className="flex flex-wrap gap-2">
								{game.categories.map((c: any) => (
									<Badge
										key={c.categoryId}
										variant="default"
										className="px-3 py-1"
									>
										{c.category.name}
									</Badge>
								))}
							</div>
						</FramePanel>
					</Frame>
				)}

				<Frame>
					<FramePanel className="p-6">
						<h3 className="mb-4 font-semibold text-lg">Metadaten</h3>
						<div className="space-y-3 text-sm">
							{isPending ? (
								<>
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
									<Skeleton className="h-4 w-full" />
								</>
							) : game ? (
								<>
									<div className="flex justify-between">
										<span className="text-muted-foreground">ID:</span>
										<code className="rounded bg-muted px-2 py-1 font-mono text-xs">
											{game.id}
										</code>
									</div>
									{game.creatorName && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Erstellt von:
											</span>
											<span className="font-medium">{game.creatorName}</span>
										</div>
									)}
									<div className="flex justify-between">
										<span className="text-muted-foreground">Erstellt am:</span>
										<span>
											{new Date(game.createdAt).toLocaleString("de-DE")}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Aktualisiert am:
										</span>
										<span>
											{new Date(game.updatedAt).toLocaleString("de-DE")}
										</span>
									</div>
								</>
							) : null}
						</div>
					</FramePanel>
				</Frame>
			</div>
		</div>
	);
}

export default function GameDetailsPage({ params }: GameDetailsPageProps) {
	return (
		<Suspense
			fallback={
				<div className="container mx-auto">
					<Header className="mb-4">
						<HeaderContent>
							<div className="flex items-center gap-2">
								<Link href="/admin/games">
									<Button variant="ghost" size="sm">
										<ArrowLeft className="h-4 w-4" />
									</Button>
								</Link>
								<div>
									<HeaderTitle>
										<Skeleton className="h-8 w-64" />
									</HeaderTitle>
									<HeaderDescription>Details zum Spiel</HeaderDescription>
								</div>
							</div>
						</HeaderContent>
					</Header>
					<div className="space-y-4">
						<Frame>
							<FramePanel className="p-6">
								<div className="flex flex-col gap-6 lg:flex-row">
									<Skeleton className="aspect-video w-full rounded-lg lg:w-1/3" />
									<div className="flex-1 space-y-3">
										<Skeleton className="h-8 w-3/4" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-full" />
										<Skeleton className="h-4 w-2/3" />
									</div>
								</div>
							</FramePanel>
						</Frame>
					</div>
				</div>
			}
		>
			<GameDetailsContent params={params} />
		</Suspense>
	);
}
