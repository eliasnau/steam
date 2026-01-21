import { ORPCError } from "@orpc/server";
import { db, eq, inArray } from "@repo/db";
import {
	categories,
	developers,
	game,
	gameToCategories,
	gameToDevelopers,
	gameToGenres,
	gameToOperatingSystems,
	gameToTags,
	genres,
	operatingSystems,
	publishers,
	publishersToGame,
	tags,
} from "@repo/db/schema/index";
import { z } from "zod";
import { DB } from "../db";
import { protectedProcedure, publicProcedure } from "../index";

export const gamesRouter = {
	list: publicProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(20),
				search: z.string().optional(),
				genreIds: z.array(z.string().uuid()).optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { page, limit } = input;

			const rawSearch = input.search?.trim();
			const search = rawSearch && rawSearch.length > 0 ? rawSearch : undefined;

			const genreIds =
				input.genreIds
					?.map((g) => g.trim())
					.filter(Boolean)
					.filter((v, i, a) => a.indexOf(v) === i) ?? undefined;

			if (input.genreIds && (!genreIds || genreIds.length === 0)) {
				return {
					data: [],
					pagination: {
						page,
						limit,
						totalCount: 0,
						totalPages: 0,
						hasNextPage: false,
						hasPreviousPage: page > 1,
					},
				};
			}

			const { games, totalCount } = await DB.query.game.list({
				page,
				limit,
				search,
				genreIds,
			});

			const totalPages = Math.ceil(totalCount / limit);

			const gameIds = games.map((g) => g.id);
			const genreMap = await DB.query.game.getGenresForGames(gameIds);

			const data = games.map((g) => ({
				...g,
				genres: genreMap.get(g.id) ?? [],
			}));

			return {
				data,
				pagination: {
					page,
					limit,
					totalCount,
					totalPages,
					hasNextPage: page < totalPages,
					hasPreviousPage: page > 1,
				},
			};
		}),

	getAll: publicProcedure.handler(async () => {
		return [];
	}),

	getById: publicProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			return { id: input.id, name: "Game", description: null };
		}),

	create: protectedProcedure
		.input(
			z.object({
				steamId: z.number().min(1, "Steam-ID ist erforderlich"),
				name: z.string().min(1, "Name ist erforderlich"),
				price: z
					.string()
					.regex(/^\d+(\.\d{1,2})?$/, "Ungültiges Preisformat")
					.nullable()
					.optional(),
				publishedAt: z
					.string()
					.min(1, "Veröffentlichungsdatum ist erforderlich"),
				rating: z
					.number()
					.min(1, "Bewertung muss mindestens 1 sein")
					.max(6, "Bewertung darf nicht größer als 6 sein"),
				image: z.string().optional(),
				shortDescription: z.string().optional(),
				website: z.string().optional(),

				genres: z.array(z.string().uuid("Ungültige Genre-ID")).optional(),
				features: z.array(z.string().uuid("Ungültige Feature-ID")).optional(),
				operatingSystems: z
					.array(z.string().uuid("Ungültige Betriebssystem-ID"))
					.optional(),
				tags: z.array(z.string().uuid("Ungültige Tag-ID")).optional(),
				developers: z
					.array(z.string().uuid("Ungültige Entwickler-ID"))
					.optional(),
				publishers: z
					.array(z.string().uuid("Ungültige Publisher-ID"))
					.optional(),

				franchiseId: z.string().uuid("Ungültige Franchise-ID").optional(),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const existingGame = await db
					.select()
					.from(game)
					.where(eq(game.steamId, input.steamId))
					.limit(1);

				if (existingGame.length > 0) {
					throw new ORPCError("CONFLICT", {
						message: "Ein Spiel mit dieser Steam ID existiert bereits",
					});
				}

				const [
					genreRecords,
					categoryRecords,
					osRecords,
					tagRecords,
					developerRecords,
					publisherRecords,
				] = await Promise.all([
					input.genres && input.genres.length > 0
						? db
								.select({ id: genres.id })
								.from(genres)
								.where(inArray(genres.id, input.genres))
						: Promise.resolve([]),
					input.features && input.features.length > 0
						? db
								.select({ id: categories.id })
								.from(categories)
								.where(inArray(categories.id, input.features))
						: Promise.resolve([]),
					input.operatingSystems && input.operatingSystems.length > 0
						? db
								.select({ id: operatingSystems.id })
								.from(operatingSystems)
								.where(inArray(operatingSystems.id, input.operatingSystems))
						: Promise.resolve([]),
					input.tags && input.tags.length > 0
						? db
								.select({ id: tags.id })
								.from(tags)
								.where(inArray(tags.id, input.tags))
						: Promise.resolve([]),
					input.developers && input.developers.length > 0
						? db
								.select({ id: developers.id })
								.from(developers)
								.where(inArray(developers.id, input.developers))
						: Promise.resolve([]),
					input.publishers && input.publishers.length > 0
						? db
								.select({ id: publishers.id })
								.from(publishers)
								.where(inArray(publishers.id, input.publishers))
						: Promise.resolve([]),
				]);

				const missingItems: string[] = [];

				if (
					input.genres &&
					input.genres.length > 0 &&
					genreRecords.length !== input.genres.length
				) {
					const foundGenreIds = genreRecords.map((g) => g.id);
					const missingGenreIds = input.genres.filter(
						(id) => !foundGenreIds.includes(id),
					);
					if (missingGenreIds.length > 0) {
						missingItems.push(`Genres mit IDs: ${missingGenreIds.join(", ")}`);
					}
				}

				if (
					input.features &&
					input.features.length > 0 &&
					categoryRecords.length !== input.features.length
				) {
					const foundCategoryIds = categoryRecords.map((c) => c.id);
					const missingCategoryIds = input.features.filter(
						(id) => !foundCategoryIds.includes(id),
					);
					if (missingCategoryIds.length > 0) {
						missingItems.push(
							`Features mit IDs: ${missingCategoryIds.join(", ")}`,
						);
					}
				}

				if (
					input.operatingSystems &&
					input.operatingSystems.length > 0 &&
					osRecords.length !== input.operatingSystems.length
				) {
					const foundOSIds = osRecords.map((os) => os.id);
					const missingOSIds = input.operatingSystems.filter(
						(id) => !foundOSIds.includes(id),
					);
					if (missingOSIds.length > 0) {
						missingItems.push(
							`Betriebssysteme mit IDs: ${missingOSIds.join(", ")}`,
						);
					}
				}

				if (
					input.tags &&
					input.tags.length > 0 &&
					tagRecords.length !== input.tags.length
				) {
					const foundTagIds = tagRecords.map((t) => t.id);
					const missingTagIds = input.tags.filter(
						(id) => !foundTagIds.includes(id),
					);
					if (missingTagIds.length > 0) {
						missingItems.push(`Tags mit IDs: ${missingTagIds.join(", ")}`);
					}
				}

				if (
					input.developers &&
					input.developers.length > 0 &&
					developerRecords.length !== input.developers.length
				) {
					const foundDeveloperIds = developerRecords.map((d) => d.id);
					const missingDeveloperIds = input.developers.filter(
						(id) => !foundDeveloperIds.includes(id),
					);
					if (missingDeveloperIds.length > 0) {
						missingItems.push(
							`Entwickler mit IDs: ${missingDeveloperIds.join(", ")}`,
						);
					}
				}

				if (
					input.publishers &&
					input.publishers.length > 0 &&
					publisherRecords.length !== input.publishers.length
				) {
					const foundPublisherIds = publisherRecords.map((p) => p.id);
					const missingPublisherIds = input.publishers.filter(
						(id) => !foundPublisherIds.includes(id),
					);
					if (missingPublisherIds.length > 0) {
						missingItems.push(
							`Publisher mit IDs: ${missingPublisherIds.join(", ")}`,
						);
					}
				}

				if (missingItems.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: `Die folgenden Elemente existieren nicht: ${missingItems.join("; ")}`,
					});
				}

				const newGame = await db.transaction(async (tx) => {
					const [insertedGame] = await tx
						.insert(game)
						.values({
							steamId: input.steamId,
							name: input.name,
							price: input.price || null,
							releasedAt: input.publishedAt,
							rating: input.rating,
							image: input.image || null,
							shortDescription: input.shortDescription || null,
							website: input.website || null,
							franchiseId: input.franchiseId || null,
						})
						.returning();

					if (!insertedGame) {
						throw new Error("Fehler beim Einfügen des Spiels");
					}

					if (genreRecords.length > 0) {
						await tx.insert(gameToGenres).values(
							genreRecords.map((genre) => ({
								gameId: insertedGame.id,
								genreId: genre.id,
							})),
						);
					}

					if (categoryRecords.length > 0) {
						await tx.insert(gameToCategories).values(
							categoryRecords.map((category) => ({
								gameId: insertedGame.id,
								categoryId: category.id,
							})),
						);
					}

					if (osRecords.length > 0) {
						await tx.insert(gameToOperatingSystems).values(
							osRecords.map((os) => ({
								gameId: insertedGame.id,
								operatingSystemId: os.id,
							})),
						);
					}

					if (tagRecords.length > 0) {
						await tx.insert(gameToTags).values(
							tagRecords.map((tag) => ({
								gameId: insertedGame.id,
								tagId: tag.id,
							})),
						);
					}

					if (developerRecords.length > 0) {
						await tx.insert(gameToDevelopers).values(
							developerRecords.map((developer) => ({
								gameId: insertedGame.id,
								developerId: developer.id,
							})),
						);
					}

					if (publisherRecords.length > 0) {
						await tx.insert(publishersToGame).values(
							publisherRecords.map((publisher) => ({
								gameId: insertedGame.id,
								publisherId: publisher.id,
							})),
						);
					}

					return insertedGame;
				});

				return {
					success: true,
					game: newGame,
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}

				console.error("Error creating game:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Spiels",
				});
			}
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().min(1).optional(),
				description: z.string().optional(),
			}),
		)
		.handler(async () => {
			return { success: true };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async () => {
			return { success: true };
		}),

	fetchSteamData: protectedProcedure
		.input(z.object({ steamId: z.number().min(1) }))
		.handler(async ({ input }) => {
			try {
				const [detailsResponse, reviewsResponse] = await Promise.all([
					fetch(
						`https://store.steampowered.com/api/appdetails?appids=${input.steamId}`,
					),
					fetch(
						`https://store.steampowered.com/appreviews/${input.steamId}?json=1`,
					),
				]);

				if (!detailsResponse.ok) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Fehler beim Abrufen der Steam-Daten",
					});
				}

				const data = (await detailsResponse.json()) as Record<
					string,
					{
						success: boolean;
						data?: {
							steam_appid: number;
							name: string;
							is_free: boolean;
							header_image?: string;
							short_description?: string;
							website?: string;
							supported_languages?: string;
							type?: string;
							release_date?: {
								coming_soon: boolean;
								date?: string;
							};
							recommendations?: {
								total?: number;
							};
							platforms?: {
								windows?: boolean;
								mac?: boolean;
								linux?: boolean;
							};
							categories?: Array<{ id: number; description: string }>;
							genres?: Array<{ id: string; description: string }>;
							developers?: string[];
							publishers?: string[];
							package_groups?: Array<{
								subs?: Array<{
									price_in_cents_with_discount?: number;
								}>;
							}>;
						};
					}
				>;
				const appData = data[input.steamId];

				if (!appData || !appData.success || !appData.data) {
					throw new ORPCError("NOT_FOUND", {
						message: "Spiel mit dieser Steam-ID nicht gefunden",
					});
				}

				const gameData = appData.data;

				let reviewScore: number | null = null;
				let reviewScoreDesc: string | null = null;
				let totalPositive = 0;
				let totalNegative = 0;
				let totalReviews = 0;

				if (reviewsResponse.ok) {
					try {
						const reviewsData = (await reviewsResponse.json()) as {
							success: number;
							query_summary?: {
								review_score?: number;
								review_score_desc?: string;
								total_positive?: number;
								total_negative?: number;
								total_reviews?: number;
							};
						};

						if (reviewsData.success === 1 && reviewsData.query_summary) {
							reviewScore = reviewsData.query_summary.review_score ?? null;
							reviewScoreDesc =
								reviewsData.query_summary.review_score_desc ?? null;
							totalPositive = reviewsData.query_summary.total_positive ?? 0;
							totalNegative = reviewsData.query_summary.total_negative ?? 0;
							totalReviews = reviewsData.query_summary.total_reviews ?? 0;
						}
					} catch (error) {
						console.error("Error parsing review data:", error);
					}
				}

				const categorySteamIds =
					gameData.categories?.map((c: { id: number }) => c.id) || [];
				const categoryRecords =
					categorySteamIds.length > 0
						? await db
								.select({ id: categories.id, steamId: categories.steamId })
								.from(categories)
								.where(inArray(categories.steamId, categorySteamIds))
						: [];

				const genreSteamIds =
					gameData.genres?.map((g: { id: string }) => Number.parseInt(g.id)) ||
					[];
				const genreRecords =
					genreSteamIds.length > 0
						? await db
								.select({ id: genres.id, steamId: genres.steamId })
								.from(genres)
								.where(inArray(genres.steamId, genreSteamIds))
						: [];

				const osNames: string[] = [];
				if (gameData.platforms?.windows) osNames.push("Windows");
				if (gameData.platforms?.mac) osNames.push("macOS");
				if (gameData.platforms?.linux) osNames.push("Linux");

				const osRecords =
					osNames.length > 0
						? await db
								.select({
									id: operatingSystems.id,
									name: operatingSystems.name,
								})
								.from(operatingSystems)
								.where(inArray(operatingSystems.name, osNames))
						: [];

				const developerNames = gameData.developers || [];
				const developerRecords =
					developerNames.length > 0
						? await db
								.select({ id: developers.id, name: developers.name })
								.from(developers)
								.where(inArray(developers.name, developerNames))
						: [];

				const publisherNames = gameData.publishers || [];
				const publisherRecords =
					publisherNames.length > 0
						? await db
								.select({ id: publishers.id, name: publishers.name })
								.from(publishers)
								.where(inArray(publishers.name, publisherNames))
						: [];

				let price: string | null = null;
				if (!gameData.is_free && gameData.package_groups?.[0]?.subs?.[0]) {
					const priceInCents =
						gameData.package_groups[0].subs[0].price_in_cents_with_discount ||
						0;
					price = (priceInCents / 100).toFixed(2);
				}

				let releasedAt = new Date().toISOString().split("T")[0];
				if (
					gameData.release_date &&
					!gameData.release_date.coming_soon &&
					gameData.release_date.date
				) {
					try {
						const parsedDate = new Date(gameData.release_date.date);
						if (!Number.isNaN(parsedDate.getTime())) {
							releasedAt = parsedDate.toISOString().split("T")[0];
						}
					} catch {}
				}

				let rating: number | undefined;
				if (totalReviews > 0) {
					const positivePercentage = (totalPositive / totalReviews) * 100;
					if (positivePercentage < 20) rating = 1;
					else if (positivePercentage < 40) rating = 2;
					else if (positivePercentage < 70) rating = 3;
					else if (positivePercentage < 80) rating = 4;
					else if (positivePercentage < 95) rating = 5;
					else rating = 6;
				}

				return {
					steamId: gameData.steam_appid,
					name: gameData.name,
					price: price,
					publishedAt: releasedAt,
					rating: rating,
					image: gameData.header_image || undefined,
					shortDescription: gameData.short_description || undefined,
					website: gameData.website || undefined,
					genres: genreRecords.map((g) => g.id),
					features: categoryRecords.map((c) => c.id),
					operatingSystems: osRecords.map((os) => os.id),
					developers: developerRecords.map((d) => d.id),
					publishers: publisherRecords.map((p) => p.id),
					metadata: {
						supportedLanguages: gameData.supported_languages,
						isFree: gameData.is_free,
						type: gameData.type,
						reviewScore: reviewScore,
						reviewScoreDesc: reviewScoreDesc,
						totalPositive: totalPositive,
						totalNegative: totalNegative,
						totalReviews: totalReviews,
						unmatchedCategories: categorySteamIds.filter(
							(id) => !categoryRecords.some((r) => r.steamId === id),
						),
						unmatchedGenres: genreSteamIds.filter(
							(id) => !genreRecords.some((r) => r.steamId === id),
						),
						unmatchedDevelopers: developerNames.filter(
							(name: string) => !developerRecords.some((r) => r.name === name),
						),
						unmatchedPublishers: publisherNames.filter(
							(name: string) => !publisherRecords.some((r) => r.name === name),
						),
						unmatchedOperatingSystems: osNames.filter(
							(name) => !osRecords.some((r) => r.name === name),
						),
					},
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}

				console.error("Error fetching Steam data:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Verarbeiten der Steam-Daten",
				});
			}
		}),

	createFromSteam: protectedProcedure
		.input(z.object({ steamId: z.number().min(1) }))
		.handler(async ({ input, context }) => {
			try {
				const existingGame = await db
					.select()
					.from(game)
					.where(eq(game.steamId, input.steamId))
					.limit(1);

				if (existingGame.length > 0) {
					throw new ORPCError("CONFLICT", {
						message: "Ein Spiel mit dieser Steam ID existiert bereits",
					});
				}

				const [detailsResponse, reviewsResponse, steamspyResponse] =
					await Promise.all([
						fetch(
							`https://store.steampowered.com/api/appdetails?appids=${input.steamId}`,
						),
						fetch(
							`https://store.steampowered.com/appreviews/${input.steamId}?json=1`,
						),
						fetch(
							`https://steamspy.com/api.php?request=appdetails&appid=${input.steamId}`,
							{ signal: AbortSignal.timeout(5000) },
						).catch(() => null),
					]);

				if (!detailsResponse.ok) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Fehler beim Abrufen der Steam-Daten",
					});
				}

				const data = (await detailsResponse.json()) as Record<
					string,
					{
						success: boolean;
						data?: {
							steam_appid: number;
							name: string;
							is_free: boolean;
							header_image?: string;
							short_description?: string;
							website?: string;
							release_date?: {
								coming_soon: boolean;
								date?: string;
							};
							platforms?: {
								windows?: boolean;
								mac?: boolean;
								linux?: boolean;
							};
							categories?: Array<{ id: number; description: string }>;
							genres?: Array<{ id: string; description: string }>;
							developers?: string[];
							publishers?: string[];
							package_groups?: Array<{
								subs?: Array<{
									price_in_cents_with_discount?: number;
								}>;
							}>;
						};
					}
				>;
				const appData = data[input.steamId];

				if (!appData || !appData.success || !appData.data) {
					throw new ORPCError("NOT_FOUND", {
						message: "Spiel mit dieser Steam-ID nicht gefunden",
					});
				}

				const gameData = appData.data;

				let totalPositive = 0;
				let totalReviews = 0;

				if (reviewsResponse.ok) {
					try {
						const reviewsData = (await reviewsResponse.json()) as {
							success: number;
							query_summary?: {
								review_score?: number;
								total_positive?: number;
								total_negative?: number;
								total_reviews?: number;
							};
						};

						if (reviewsData.success === 1 && reviewsData.query_summary) {
							totalPositive = reviewsData.query_summary.total_positive ?? 0;
							totalReviews = reviewsData.query_summary.total_reviews ?? 0;
						}
					} catch (error) {
						console.error("Error parsing review data:", error);
					}
				}

				const categorySteamIds =
					gameData.categories?.map((c: { id: number }) => c.id) || [];
				const categoryRecords: Array<{ id: string; steamId: number }> = [];

				if (categorySteamIds.length > 0) {
					const existingCategories = await db
						.select({ id: categories.id, steamId: categories.steamId })
						.from(categories)
						.where(inArray(categories.steamId, categorySteamIds));

					categoryRecords.push(...existingCategories);

					const existingSteamIds = new Set(
						existingCategories.map((c) => c.steamId),
					);
					const missingCategories = gameData.categories?.filter(
						(c: { id: number }) => !existingSteamIds.has(c.id),
					);

					if (missingCategories && missingCategories.length > 0) {
						const newCategories = await db
							.insert(categories)
							.values(
								missingCategories.map(
									(c: { id: number; description: string }) => ({
										steamId: c.id,
										name: c.description,
									}),
								),
							)
							.returning({ id: categories.id, steamId: categories.steamId });

						categoryRecords.push(...newCategories);
					}
				}

				const genreSteamIds =
					gameData.genres?.map((g: { id: string }) => Number.parseInt(g.id)) ||
					[];
				const genreRecords: Array<{ id: string; steamId: number }> = [];

				if (genreSteamIds.length > 0) {
					const existingGenres = await db
						.select({ id: genres.id, steamId: genres.steamId })
						.from(genres)
						.where(inArray(genres.steamId, genreSteamIds));

					genreRecords.push(...existingGenres);

					const existingSteamIds = new Set(
						existingGenres.map((g) => g.steamId),
					);
					const missingGenres = gameData.genres?.filter(
						(g: { id: string }) => !existingSteamIds.has(Number.parseInt(g.id)),
					);

					if (missingGenres && missingGenres.length > 0) {
						const newGenres = await db
							.insert(genres)
							.values(
								missingGenres.map((g: { id: string; description: string }) => ({
									steamId: Number.parseInt(g.id),
									name: g.description,
								})),
							)
							.returning({ id: genres.id, steamId: genres.steamId });

						genreRecords.push(...newGenres);
					}
				}

				const osNames: string[] = [];
				if (gameData.platforms?.windows) osNames.push("Windows");
				if (gameData.platforms?.mac) osNames.push("macOS");
				if (gameData.platforms?.linux) osNames.push("Linux");

				const osRecords =
					osNames.length > 0
						? await db
								.select({
									id: operatingSystems.id,
									name: operatingSystems.name,
								})
								.from(operatingSystems)
								.where(inArray(operatingSystems.name, osNames))
						: [];

				const developerNames = gameData.developers || [];
				const developerRecords: Array<{ id: string; name: string }> = [];

				if (developerNames.length > 0) {
					const existingDevelopers = await db
						.select({ id: developers.id, name: developers.name })
						.from(developers)
						.where(inArray(developers.name, developerNames));

					developerRecords.push(...existingDevelopers);

					const existingNames = new Set(existingDevelopers.map((d) => d.name));
					const missingDevelopers = developerNames.filter(
						(name: string) => !existingNames.has(name),
					);

					if (missingDevelopers.length > 0) {
						const newDevelopers = await db
							.insert(developers)
							.values(missingDevelopers.map((name: string) => ({ name })))
							.returning({ id: developers.id, name: developers.name });

						developerRecords.push(...newDevelopers);
					}
				}

				const publisherNames = gameData.publishers || [];
				const publisherRecords: Array<{ id: string; name: string }> = [];

				if (publisherNames.length > 0) {
					const existingPublishers = await db
						.select({ id: publishers.id, name: publishers.name })
						.from(publishers)
						.where(inArray(publishers.name, publisherNames));

					publisherRecords.push(...existingPublishers);

					const existingNames = new Set(existingPublishers.map((p) => p.name));
					const missingPublishers = publisherNames.filter(
						(name: string) => !existingNames.has(name),
					);

					if (missingPublishers.length > 0) {
						const newPublishers = await db
							.insert(publishers)
							.values(missingPublishers.map((name: string) => ({ name })))
							.returning({ id: publishers.id, name: publishers.name });

						publisherRecords.push(...newPublishers);
					}
				}

				let tagNames: string[] = [];
				if (steamspyResponse) {
					try {
						const steamspyData = (await steamspyResponse.json()) as {
							appid: number;
							name: string;
							tags?: Record<string, number>;
							[key: string]: unknown;
						};

						if (steamspyData.tags && typeof steamspyData.tags === "object") {
							tagNames = Object.keys(steamspyData.tags);
						}
					} catch (error) {
						console.warn(
							`SteamSpy API error for appid ${input.steamId}:`,
							error,
						);
					}
				}

				const tagRecords = await DB.query.tags.getOrCreateTags(tagNames);

				let price: string | null = null;
				if (!gameData.is_free && gameData.package_groups?.[0]?.subs?.[0]) {
					const priceInCents =
						gameData.package_groups[0].subs[0].price_in_cents_with_discount ||
						0;
					price = (priceInCents / 100).toFixed(2);
				}

				const releasedAt: string = (() => {
					if (
						gameData.release_date &&
						!gameData.release_date.coming_soon &&
						gameData.release_date.date
					) {
						try {
							const parsedDate = new Date(gameData.release_date.date);
							if (!Number.isNaN(parsedDate.getTime())) {
								const dateStr = parsedDate.toISOString().split("T")[0];
								return dateStr || new Date().toISOString().split("T")[0]!;
							}
						} catch {}
					}
					return new Date().toISOString().split("T")[0]!;
				})();

				const rating: number = (() => {
					if (totalReviews > 0) {
						const positivePercentage = (totalPositive / totalReviews) * 100;
						if (positivePercentage < 20) return 1;
						if (positivePercentage < 40) return 2;
						if (positivePercentage < 70) return 3;
						if (positivePercentage < 80) return 4;
						if (positivePercentage < 95) return 5;
						return 6;
					}
					return 3;
				})();

				const missingOSNames = osNames.filter(
					(name) => !osRecords.some((r) => r.name === name),
				);

				if (missingOSNames.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: `Die folgenden Betriebssysteme existieren nicht in der Datenbank: ${missingOSNames.join(", ")}. Bitte erstellen Sie diese zuerst.`,
					});
				}

				const newGame = await db.transaction(async (tx) => {
					const [insertedGame] = await tx
						.insert(game)
						.values({
							steamId: gameData.steam_appid,
							name: gameData.name,
							price: price,
							releasedAt: releasedAt,
							rating: rating,
							image: gameData.header_image || null,
							shortDescription: gameData.short_description || null,
							website: gameData.website || null,
							franchiseId: null,
							createdBy: context.session.user.id || null,
						})
						.returning();

					if (!insertedGame) {
						throw new Error("Fehler beim Einfügen des Spiels");
					}

					if (genreRecords.length > 0) {
						await tx.insert(gameToGenres).values(
							genreRecords.map((genre) => ({
								gameId: insertedGame.id,
								genreId: genre.id,
							})),
						);
					}

					if (categoryRecords.length > 0) {
						await tx.insert(gameToCategories).values(
							categoryRecords.map((category) => ({
								gameId: insertedGame.id,
								categoryId: category.id,
							})),
						);
					}

					if (osRecords.length > 0) {
						await tx.insert(gameToOperatingSystems).values(
							osRecords.map((os) => ({
								gameId: insertedGame.id,
								operatingSystemId: os.id,
							})),
						);
					}

					if (developerRecords.length > 0) {
						await tx.insert(gameToDevelopers).values(
							developerRecords.map((developer) => ({
								gameId: insertedGame.id,
								developerId: developer.id,
							})),
						);
					}

					if (publisherRecords.length > 0) {
						await tx.insert(publishersToGame).values(
							publisherRecords.map((publisher) => ({
								gameId: insertedGame.id,
								publisherId: publisher.id,
							})),
						);
					}

					if (tagRecords.length > 0) {
						await tx.insert(gameToTags).values(
							tagRecords.map((tag: { id: string; name: string }) => ({
								gameId: insertedGame.id,
								tagId: tag.id,
							})),
						);
					}

					return insertedGame;
				});

				return {
					success: true,
					game: newGame,
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}

				console.error("Error creating game from Steam:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Spiels",
				});
			}
		}),
};
