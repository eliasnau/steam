import * as gameMutations from "./mutations/game";
import * as gameQueries from "./queries/game";
import * as tagQueries from "./queries/tags";
import * as validationQueries from "./queries/validation";

export const DB = {
	query: {
		game: {
			getById: gameQueries.getGameById,
			getBySteamId: gameQueries.getGameBySteamId,
			list: gameQueries.listGames,
			getGenresForGames: gameQueries.getGenresForGames,
			getTagsForGames: gameQueries.getTagsForGames,
			getCategoriesForGames: gameQueries.getCategoriesForGames,
			getDevelopersForGames: gameQueries.getDevelopersForGames,
		},
		tags: {
			getOrCreateTags: tagQueries.getOrCreateTags,
		},
		validation: {
			validateGenres: validationQueries.validateGenres,
			validateCategories: validationQueries.validateCategories,
			validateOperatingSystems: validationQueries.validateOperatingSystems,
			validateTags: validationQueries.validateTags,
			validateDevelopers: validationQueries.validateDevelopers,
			validatePublishers: validationQueries.validatePublishers,
		},
	},
	mutation: {
		game: {
			create: gameMutations.createGame,
		},
	},
};
