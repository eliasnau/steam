import { ORPCError } from "@orpc/server";
import { and, count, db, eq, ilike, inArray } from "@repo/db";
import { gameToGenres, genres } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";

export const genresRouter = {
	list: publicProcedure
		.input(
			z.object({
				page: z.number().min(1).default(1),
				limit: z.number().min(1).max(100).default(20),
				search: z.string().optional(),
			}),
		)
		.handler(async ({ input }) => {
			const { page, limit } = input;

			const rawSearch = input.search?.trim();
			const search = rawSearch && rawSearch.length > 0 ? rawSearch : undefined;

			const offset = (page - 1) * limit;

			const genreWhere = and(
				search ? ilike(genres.name, `%${search}%`) : undefined,
			);

			const genreList = await db
				.select({
					id: genres.id,
					name: genres.name,
					createdAt: genres.createdAt,
					updatedAt: genres.updatedAt,
				})
				.from(genres)
				.where(genreWhere)
				.limit(limit)
				.offset(offset)
				.orderBy(genres.name);

			const [{ count: totalCount = 0 } = { count: 0 }] = await db
				.select({ count: count() })
				.from(genres)
				.where(genreWhere);

			const totalPages = Math.ceil(totalCount / limit);

			// Count games for each genre
			const genreIds = genreList.map((g) => g.id);
			const gameCounts = new Map<string, number>();

			if (genreIds.length > 0) {
				const gameCountRows = await db
					.select({
						genreId: gameToGenres.genreId,
						count: count(),
					})
					.from(gameToGenres)
					.where(inArray(gameToGenres.genreId, genreIds))
					.groupBy(gameToGenres.genreId);

				for (const row of gameCountRows) {
					gameCounts.set(row.genreId, Number(row.count));
				}
			}

			const data = genreList.map((g) => ({
				...g,
				gameCount: gameCounts.get(g.id) ?? 0,
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
		const allGenres = await db.select().from(genres);
		return allGenres;
	}),

	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1, "Name ist erforderlich"),
			}),
		)
		.handler(async ({ input }) => {
			try {
				const existing = await db
					.select()
					.from(genres)
					.where(eq(genres.name, input.name.trim()))
					.limit(1);

				if (existing.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Dieses Genre existiert bereits.",
					});
				}

				const [newGenre] = await db
					.insert(genres)
					.values({
						name: input.name,
					})
					.returning();

				if (!newGenre) {
					throw new Error("Fehler beim Erstellen des Genre");
				}

				return {
					success: true,
					genre: newGenre,
				};
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				console.error("Error creating genre:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Genre",
				});
			}
		}),
};
