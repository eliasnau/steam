import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { categoriesRouter } from "./categories";
import { franchisesRouter } from "./franchises";
import { gamesRouter } from "./games";
import { genresRouter } from "./genres";
import { operatingSystemsRouter } from "./operating-systems";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	games: gamesRouter,
	franchises: franchisesRouter,
	genres: genresRouter,
	categories: categoriesRouter,
	operatingSystems: operatingSystemsRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
