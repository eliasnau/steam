import { db } from "@repo/db";
import {
	game,
	gameToCategories,
	gameToDevelopers,
	gameToGenres,
	gameToOperatingSystems,
	gameToTags,
	publishersToGame,
} from "@repo/db/schema/index";

interface CreateGameData {
	steamId: number;
	name: string;
	price: string | null;
	releasedAt: string;
	positiveReviews: number;
	negativeReviews: number;
	image?: string | null;
	shortDescription?: string | null;
	website?: string | null;
	franchiseId?: string | null;
	createdBy?: string | null;
}

interface GameRelationships {
	genres?: string[];
	categories?: string[];
	operatingSystems?: string[];
	tags?: string[];
	developers?: string[];
	publishers?: string[];
}

export async function createGame(
	gameData: CreateGameData,
	relationships: GameRelationships = {},
) {
	return await db.transaction(async (tx) => {
		const [insertedGame] = await tx
			.insert(game)
			.values({
				steamId: gameData.steamId,
				name: gameData.name,
				price: gameData.price,
				releasedAt: gameData.releasedAt,
				positiveReviews: gameData.positiveReviews,
				negativeReviews: gameData.negativeReviews,
				image: gameData.image || null,
				shortDescription: gameData.shortDescription || null,
				website: gameData.website || null,
				franchiseId: gameData.franchiseId || null,
				createdBy: gameData.createdBy || null,
			})
			.returning();

		if (!insertedGame) {
			throw new Error("Fehler beim Einfügen des Spiels");
		}

		if (relationships.genres && relationships.genres.length > 0) {
			await tx.insert(gameToGenres).values(
				relationships.genres.map((genreId) => ({
					gameId: insertedGame.id,
					genreId: genreId,
				})),
			);
		}

		if (relationships.categories && relationships.categories.length > 0) {
			await tx.insert(gameToCategories).values(
				relationships.categories.map((categoryId) => ({
					gameId: insertedGame.id,
					categoryId: categoryId,
				})),
			);
		}

		if (
			relationships.operatingSystems &&
			relationships.operatingSystems.length > 0
		) {
			await tx.insert(gameToOperatingSystems).values(
				relationships.operatingSystems.map((osId) => ({
					gameId: insertedGame.id,
					operatingSystemId: osId,
				})),
			);
		}

		if (relationships.tags && relationships.tags.length > 0) {
			await tx.insert(gameToTags).values(
				relationships.tags.map((tagId) => ({
					gameId: insertedGame.id,
					tagId: tagId,
				})),
			);
		}

		if (relationships.developers && relationships.developers.length > 0) {
			await tx.insert(gameToDevelopers).values(
				relationships.developers.map((developerId) => ({
					gameId: insertedGame.id,
					developerId: developerId,
				})),
			);
		}

		if (relationships.publishers && relationships.publishers.length > 0) {
			await tx.insert(publishersToGame).values(
				relationships.publishers.map((publisherId) => ({
					gameId: insertedGame.id,
					publisherId: publisherId,
				})),
			);
		}

		return insertedGame;
	});
}
