import { and, count, db, eq, ilike, inArray, or, sql } from "@repo/db";
import {
	categories,
	developers,
	game,
	gameToCategories,
	gameToDevelopers,
	gameToGenres,
	gameToTags,
	genres,
	publishers,
	publishersToGame,
	tags,
} from "@repo/db/schema/index";

export async function getGameBySteamId(steamId: number) {
	return await db.select().from(game).where(eq(game.steamId, steamId)).limit(1);
}

export async function getGameById(id: string) {
	return await db.select().from(game).where(eq(game.id, id)).limit(1);
}

interface ListGamesOptions {
	page: number;
	limit: number;
	search?: string;
	genreIds?: string[];
	priceRange?: "all" | "free" | "under20" | "20to40" | "over40";
}

export async function listGames(options: ListGamesOptions) {
	const { page, limit, search, genreIds, priceRange } = options;
	const offset = (page - 1) * limit;

	const conditions = [];

	if (search) {
		conditions.push(
			or(
				ilike(game.name, `%${search}%`),
				sql`CAST(${game.steamId} AS TEXT) LIKE ${`%${search}%`}`,
			),
		);
	}


	if (genreIds?.length) {
		conditions.push(
			sql`${game.id} in (
              select ${gameToGenres.gameId}
              from ${gameToGenres}
              where ${inArray(gameToGenres.genreId, genreIds)}
            )`,
		);
	}


	if (priceRange && priceRange !== "all") {
		switch (priceRange) {
			case "free":
				conditions.push(
					or(
						eq(game.price, "0"),
						eq(game.price, "0.00"),
						sql`${game.price} IS NULL`,
					),
				);
				break;
			case "under20":
				conditions.push(
					and(
						sql`${game.price} IS NOT NULL`,
						sql`CAST(${game.price} AS DECIMAL) > 0`,
						sql`CAST(${game.price} AS DECIMAL) < 20`,
					),
				);
				break;
			case "20to40":
				conditions.push(
					and(
						sql`${game.price} IS NOT NULL`,
						sql`CAST(${game.price} AS DECIMAL) >= 20`,
						sql`CAST(${game.price} AS DECIMAL) <= 40`,
					),
				);
				break;
			case "over40":
				conditions.push(
					and(
						sql`${game.price} IS NOT NULL`,
						sql`CAST(${game.price} AS DECIMAL) > 40`,
					),
				);
				break;
		}
	}

	const gameWhere = conditions.length > 0 ? and(...conditions) : undefined;

	const games = await db
		.select({
			id: game.id,
			steamId: game.steamId,
			name: game.name,
			price: game.price,
			releasedAt: game.releasedAt,
			positiveReviews: game.positiveReviews,
			negativeReviews: game.negativeReviews,
			image: game.image,
			shortDescription: game.shortDescription,
			website: game.website,
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

	return { games, totalCount };
}

export async function getGenresForGames(gameIds: string[]) {
	if (gameIds.length === 0) return new Map();

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

	return genreRows.reduce(
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

export async function getTagsForGames(gameIds: string[]) {
	if (gameIds.length === 0) return new Map();

	const tagRows = await db
		.select({
			gameId: gameToTags.gameId,
			tagId: gameToTags.tagId,
			tId: tags.id,
			tName: tags.name,
		})
		.from(gameToTags)
		.innerJoin(tags, eq(tags.id, gameToTags.tagId))
		.where(inArray(gameToTags.gameId, gameIds));

	return tagRows.reduce(
		(acc, r) => {
			const list = acc.get(r.gameId) ?? [];
			list.push({
				tagId: r.tagId,
				tag: { id: r.tId, name: r.tName },
			});
			acc.set(r.gameId, list);
			return acc;
		},
		new Map<
			string,
			{
				tagId: string;
				tag: { id: string; name: string };
			}[]
		>(),
	);
}

export async function getCategoriesForGames(gameIds: string[]) {
	if (gameIds.length === 0) return new Map();

	const categoryRows = await db
		.select({
			gameId: gameToCategories.gameId,
			categoryId: gameToCategories.categoryId,
			cId: categories.id,
			cName: categories.name,
		})
		.from(gameToCategories)
		.innerJoin(categories, eq(categories.id, gameToCategories.categoryId))
		.where(inArray(gameToCategories.gameId, gameIds));

	return categoryRows.reduce(
		(acc, r) => {
			const list = acc.get(r.gameId) ?? [];
			list.push({
				categoryId: r.categoryId,
				category: { id: r.cId, name: r.cName },
			});
			acc.set(r.gameId, list);
			return acc;
		},
		new Map<
			string,
			{
				categoryId: string;
				category: { id: string; name: string };
			}[]
		>(),
	);
}

export async function getDevelopersForGames(gameIds: string[]) {
	if (gameIds.length === 0) return new Map();

	const developerRows = await db
		.select({
			gameId: gameToDevelopers.gameId,
			developerId: gameToDevelopers.developerId,
			dId: developers.id,
			dName: developers.name,
		})
		.from(gameToDevelopers)
		.innerJoin(developers, eq(developers.id, gameToDevelopers.developerId))
		.where(inArray(gameToDevelopers.gameId, gameIds));

	return developerRows.reduce(
		(acc, r) => {
			const list = acc.get(r.gameId) ?? [];
			list.push({
				developerId: r.developerId,
				developer: { id: r.dId, name: r.dName },
			});
			acc.set(r.gameId, list);
			return acc;
		},
		new Map<
			string,
			{
				developerId: string;
				developer: { id: string; name: string };
			}[]
		>(),
	);
}

export async function getPublishersForGames(gameIds: string[]) {
	if (gameIds.length === 0) return new Map();

	const publisherRows = await db
		.select({
			gameId: publishersToGame.gameId,
			publisherId: publishersToGame.publisherId,
			pId: publishers.id,
			pName: publishers.name,
		})
		.from(publishersToGame)
		.innerJoin(publishers, eq(publishers.id, publishersToGame.publisherId))
		.where(inArray(publishersToGame.gameId, gameIds));

	return publisherRows.reduce(
		(acc, r) => {
			const list = acc.get(r.gameId) ?? [];
			list.push({
				publisherId: r.publisherId,
				publisher: { id: r.pId, name: r.pName },
			});
			acc.set(r.gameId, list);
			return acc;
		},
		new Map<
			string,
			{
				publisherId: string;
				publisher: { id: string; name: string };
			}[]
		>(),
	);
}
