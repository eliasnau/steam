import { ORPCError } from "@orpc/server";
import { and, count, db, eq, ilike, inArray } from "@repo/db";
import { gameToTags, tags } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";

export const tagsRouter = {
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

			const tagWhere = and(
				search ? ilike(tags.name, `%${search}%`) : undefined,
			);

			const tagList = await db
				.select({
					id: tags.id,
					name: tags.name,
					createdAt: tags.createdAt,
					updatedAt: tags.updatedAt,
				})
				.from(tags)
				.where(tagWhere)
				.limit(limit)
				.offset(offset)
				.orderBy(tags.name);

			const [{ count: totalCount = 0 } = { count: 0 }] = await db
				.select({ count: count() })
				.from(tags)
				.where(tagWhere);

			const totalPages = Math.ceil(totalCount / limit);

			// Count games for each tag
			const tagIds = tagList.map((t) => t.id);
			const gameCounts = new Map<string, number>();

			if (tagIds.length > 0) {
				const gameCountRows = await db
					.select({
						tagId: gameToTags.tagId,
						count: count(),
					})
					.from(gameToTags)
					.where(inArray(gameToTags.tagId, tagIds))
					.groupBy(gameToTags.tagId);

				for (const row of gameCountRows) {
					gameCounts.set(row.tagId, Number(row.count));
				}
			}

			const data = tagList.map((t) => ({
				...t,
				gameCount: gameCounts.get(t.id) ?? 0,
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
		const allTags = await db.select().from(tags);
		return allTags;
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
					.from(tags)
					.where(eq(tags.name, input.name.trim()))
					.limit(1);

				if (existing.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Dieser Publisher existiert bereits.",
					});
				}

				const [newTag] = await db
					.insert(tags)
					.values({
						name: input.name,
					})
					.returning();

				if (!newTag) {
					throw new Error("Fehler beim Erstellen des Tags");
				}

				return {
					success: true,
					tag: newTag,
				};
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				console.error("Error creating tag:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Tags",
				});
			}
		}),
};
