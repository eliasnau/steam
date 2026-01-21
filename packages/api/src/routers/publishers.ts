import { ORPCError } from "@orpc/server";
import { and, count, db, eq, ilike, inArray } from "@repo/db";
import { publishers, publishersToGame } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";

export const publishersRouter = {
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

			const publisherWhere = and(
				search ? ilike(publishers.name, `%${search}%`) : undefined,
			);

			const pubs = await db
				.select({
					id: publishers.id,
					name: publishers.name,
					teamSize: publishers.teamSize,
					createdAt: publishers.createdAt,
					updatedAt: publishers.updatedAt,
				})
				.from(publishers)
				.where(publisherWhere)
				.limit(limit)
				.offset(offset)
				.orderBy(publishers.createdAt);

			const [{ count: totalCount = 0 } = { count: 0 }] = await db
				.select({ count: count() })
				.from(publishers)
				.where(publisherWhere);

			const totalPages = Math.ceil(totalCount / limit);

			const publisherIds = pubs.map((p) => p.id);
			const gameCounts = new Map<string, number>();

			if (publisherIds.length > 0) {
				const gameCountRows = await db
					.select({
						publisherId: publishersToGame.publisherId,
						count: count(),
					})
					.from(publishersToGame)
					.where(inArray(publishersToGame.publisherId, publisherIds))
					.groupBy(publishersToGame.publisherId);

				for (const row of gameCountRows) {
					gameCounts.set(row.publisherId, Number(row.count));
				}
			}

			const data = pubs.map((p) => ({
				...p,
				gameCount: gameCounts.get(p.id) ?? 0,
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
		const allPublishers = await db.select().from(publishers);
		return allPublishers;
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
					.from(publishers)
					.where(eq(publishers.name, input.name.trim()))
					.limit(1);

				if (existing.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Dieser Publisher existiert bereits.",
					});
				}
				const [newPublisher] = await db
					.insert(publishers)
					.values({
						name: input.name.trim(),
					})
					.returning();

				if (!newPublisher) {
					throw new Error("Fehler beim Erstellen des Publishers");
				}

				return {
					success: true,
					publisher: newPublisher,
				};
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				console.error("Error creating publisher:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Publishers",
				});
			}
		}),
};
