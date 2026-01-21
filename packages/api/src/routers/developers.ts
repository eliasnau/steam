import { ORPCError } from "@orpc/server";
import { and, count, db, eq, ilike, inArray } from "@repo/db";
import { developers, gameToDevelopers } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";

export const developersRouter = {
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

			const developerWhere = and(
				search ? ilike(developers.name, `%${search}%`) : undefined,
			);

			const devs = await db
				.select({
					id: developers.id,
					name: developers.name,
					teamSize: developers.teamSize,
					createdAt: developers.createdAt,
					updatedAt: developers.updatedAt,
				})
				.from(developers)
				.where(developerWhere)
				.limit(limit)
				.offset(offset)
				.orderBy(developers.createdAt);

			const [{ count: totalCount = 0 } = { count: 0 }] = await db
				.select({ count: count() })
				.from(developers)
				.where(developerWhere);

			const totalPages = Math.ceil(totalCount / limit);

			const developerIds = devs.map((d) => d.id);
			const gameCounts = new Map<string, number>();

			if (developerIds.length > 0) {
				const gameCountRows = await db
					.select({
						developerId: gameToDevelopers.developerId,
						count: count(),
					})
					.from(gameToDevelopers)
					.where(inArray(gameToDevelopers.developerId, developerIds))
					.groupBy(gameToDevelopers.developerId);

				for (const row of gameCountRows) {
					gameCounts.set(row.developerId, Number(row.count));
				}
			}

			const data = devs.map((d) => ({
				...d,
				gameCount: gameCounts.get(d.id) ?? 0,
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
		const allDevelopers = await db.select().from(developers);
		return allDevelopers;
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
					.from(developers)
					.where(eq(developers.name, input.name.trim()))
					.limit(1);

				if (existing.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Dieses Betriebssystem existiert bereits.",
					});
				}
				const [newDeveloper] = await db
					.insert(developers)
					.values({
						name: input.name.trim(),
					})
					.returning();

				if (!newDeveloper) {
					throw new Error("Fehler beim Erstellen des Entwicklers");
				}

				return {
					success: true,
					developer: newDeveloper,
				};
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				console.error("Error creating developer:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Entwicklers",
				});
			}
		}),
};
