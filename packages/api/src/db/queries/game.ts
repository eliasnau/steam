import { and, count, db, eq, ilike, inArray, or, sql } from "@repo/db";
import { game, gameToGenres, genres } from "@repo/db/schema/index";

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
}

export async function listGames(options: ListGamesOptions) {
	const { page, limit, search, genreIds } = options;
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
			rating: game.rating,
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
