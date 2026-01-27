import "server-only";
import { cacheLife, cacheTag } from 'next/cache'

import { avg, count, db, desc, eq, sql } from "@repo/db";
import {
	developers,
	game,
	gameToDevelopers,
	gameToGenres,
	gameToTags,
	genres,
	tags,
} from "@repo/db/schema";

export const getLandingData = async () => {
	'use cache'
	cacheLife({ expire: 3600 })
	cacheTag('landing-data')
	const [
		topGenres,
		popularTags,
		topDevelopers,
		topRatedGames,
		stats,
		priceDistribution,
	] = await Promise.all([
		db
			.select({
				genreId: genres.id,
				genreName: genres.name,
				gameCount: count(gameToGenres.gameId),
			})
			.from(genres)
			.leftJoin(gameToGenres, eq(genres.id, gameToGenres.genreId))
			.groupBy(genres.id, genres.name)
			.orderBy(desc(count(gameToGenres.gameId)))
			.limit(12),

		db
			.select({
				tagId: tags.id,
				tagName: tags.name,
				gameCount: count(gameToTags.gameId),
			})
			.from(tags)
			.leftJoin(gameToTags, eq(tags.id, gameToTags.tagId))
			.groupBy(tags.id, tags.name)
			.orderBy(desc(count(gameToTags.gameId)))
			.limit(12),

		db
			.select({
				developerId: developers.id,
				developerName: developers.name,
				avgRating:
					sql<number>`avg(case when (${game.positiveReviews} + ${game.negativeReviews}) > 0 then ${game.positiveReviews}::float / (${game.positiveReviews} + ${game.negativeReviews}) else 0 end)`.as(
						"avg_rating",
					),
				gameCount: count(game.id),
			})
			.from(developers)
			.leftJoin(
				gameToDevelopers,
				eq(developers.id, gameToDevelopers.developerId),
			)
			.leftJoin(game, eq(gameToDevelopers.gameId, game.id))
			.groupBy(developers.id, developers.name)
			.having(sql`count(${game.id}) >= 3`)
			.orderBy(
				desc(
					sql`avg(case when (${game.positiveReviews} + ${game.negativeReviews}) > 0 then ${game.positiveReviews}::float / (${game.positiveReviews} + ${game.negativeReviews}) else 0 end)`,
				),
			)
			.limit(5),

		db
			.select({
				gameId: game.id,
				gameName: game.name,
				rating:
					sql<number>`case when (${game.positiveReviews} + ${game.negativeReviews}) > 0 then ${game.positiveReviews}::float / (${game.positiveReviews} + ${game.negativeReviews}) else 0 end`.as(
						"rating",
					),
				totalReviews:
					sql<number>`${game.positiveReviews} + ${game.negativeReviews}`.as(
						"total_reviews",
					),
				price: game.price,
			})
			.from(game)
			.where(sql`(${game.positiveReviews} + ${game.negativeReviews}) >= 100`)
			.orderBy(
				desc(
					sql`case when (${game.positiveReviews} + ${game.negativeReviews}) > 0 then ${game.positiveReviews}::float / (${game.positiveReviews} + ${game.negativeReviews}) else 0 end`,
				),
			)
			.limit(5),

		db
			.select({
				totalGames: count(),
				avgRating:
					sql<number>`avg(case when (${game.positiveReviews} + ${game.negativeReviews}) > 0 then ${game.positiveReviews}::float / (${game.positiveReviews} + ${game.negativeReviews}) else 0 end)`.as(
						"avg_rating",
					),
				avgPrice: avg(game.price),
				freeGames:
					sql<number>`count(*) filter (where ${game.price} = 0 or ${game.price} is null)`.as(
						"free_games",
					),
			})
			.from(game),

		db
			.select({
				range: sql<string>`case 
					when ${game.price} = 0 or ${game.price} is null then 'Free'
					when ${game.price} > 0 and ${game.price} <= 10 then 'Under $10'
					when ${game.price} > 10 and ${game.price} <= 20 then 'Under $20'
					when ${game.price} > 20 and ${game.price} <= 50 then 'Under $50'
					else 'Over $50'
				end`.as("range"),
				count: count(),
			})
			.from(game)
			.groupBy(sql`case 
				when ${game.price} = 0 or ${game.price} is null then 'Free'
				when ${game.price} > 0 and ${game.price} <= 10 then 'Under $10'
				when ${game.price} > 10 and ${game.price} <= 20 then 'Under $20'
				when ${game.price} > 20 and ${game.price} <= 50 then 'Under $50'
				else 'Over $50'
			end`)
			.orderBy(sql`min(case 
				when ${game.price} = 0 or ${game.price} is null then 1
				when ${game.price} > 0 and ${game.price} <= 10 then 2
				when ${game.price} > 10 and ${game.price} <= 20 then 3
				when ${game.price} > 20 and ${game.price} <= 50 then 4
				else 5
			end)`),
	]);

	return {
		topGenres,
		popularTags,
		topDevelopers,
		topRatedGames,
		stats: stats[0],
		priceDistribution,
	};
};
