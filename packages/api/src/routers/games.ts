import { ORPCError } from "@orpc/server";
import { and, count, db, eq, ilike, inArray, or, sql } from "@repo/db";
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

			const offset = (page - 1) * limit;

			const gameWhere = and(
				search
					? or(
							ilike(game.name, `%${search}%`),
							sql`CAST(${game.steamId} AS TEXT) LIKE ${`%${search}%`}`,
						)
					: undefined,
				genreIds?.length
					? sql`${game.id} in (
              select ${gameToGenres.gameId}
              from ${gameToGenres}
              where ${inArray(gameToGenres.genreId, genreIds)}
            )`
					: undefined,
			);

			const games = await db
				.select({
					id: game.id,
					steamId: game.steamId,
					name: game.name,
					price: game.price,
					releasedAt: game.releasedAt,
					playerCountAllTime: game.playerCountAllTime,
					rating: game.rating,
					image: game.image,
					franchiseId: game.franchiseId,
					createdAt: game.createdAt,
					updatedAt: game.updatedAt,
				})
				.from(game)
				.where(gameWhere)
				.limit(limit)
				.offset(offset)
				.orderBy(game.createdAt);

			const [{ count: totalCount = 0 } = { count: 0 }] = await db
				.select({ count: count() })
				.from(game)
				.where(gameWhere);

			const totalPages = Math.ceil(totalCount / limit);

			// Fetch genre info for the listed games in one shot
			const gameIds = games.map((g) => g.id);
			let genreMap = new Map<
				string,
				{ genreId: string; genre: { id: string; name: string } }[]
			>();

			if (gameIds.length > 0) {
				const genreRows = await db
					.select({
						gameId: gameToGenres.gameId,
						genreId: gameToGenres.genreId,
						gId: genres.id,
						gName: genres.name,
					})
					.from(gameToGenres)
					.innerJoin(genres, eq(genres.id, gameToGenres.genreId))
					.where(inArray(gameToGenres.gameId, gameIds));

				genreMap = genreRows.reduce(
					(acc, r) => {
						const list = acc.get(r.gameId) ?? [];
						list.push({
							genreId: r.genreId,
							genre: { id: r.gId, name: r.gName },
						});
						acc.set(r.gameId, list);
						return acc;
					},
					new Map<
						string,
						{
							genreId: string;
							genre: { id: string; name: string };
						}[]
					>(),
				);
			}

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
				price: z.string().regex(/^\d+(\.\d{1,2})?$/, "Ungültiges Preisformat"),
				publishedAt: z
					.string()
					.min(1, "Veröffentlichungsdatum ist erforderlich"),
				playerCountAllTime: z.string(),
				rating: z
					.number()
					.min(1, "Bewertung muss mindestens 1 sein")
					.max(6, "Bewertung darf nicht größer als 6 sein"),
				image: z.string().optional(),

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
							price: input.price,
							releasedAt: input.publishedAt,
							playerCountAllTime:
								Number.parseInt(input.playerCountAllTime) || 0,
							rating: input.rating,
							image: input.image || null,
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
		.handler(async ({ input }) => {
			return { success: true };
		}),

	delete: protectedProcedure
		.input(z.object({ id: z.string() }))
		.handler(async ({ input }) => {
			return { success: true };
		}),
};
