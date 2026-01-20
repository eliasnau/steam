import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { categoriesRouter } from "./categories";
import { developersRouter } from "./developers";
import { franchisesRouter } from "./franchises";
import { gamesRouter } from "./games";
import { genresRouter } from "./genres";
import { operatingSystemsRouter } from "./operating-systems";
import { publishersRouter } from "./publishers";
import { tagsRouter } from "./tags";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	games: gamesRouter,
	franchises: franchisesRouter,
	genres: genresRouter,
	categories: categoriesRouter,
	operatingSystems: operatingSystemsRouter,
	tags: tagsRouter,
	developers: developersRouter,
	publishers: publishersRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
