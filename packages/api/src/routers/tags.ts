import { ORPCError } from "@orpc/server";
import { db } from "@repo/db";
import { tags } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { eq } from "@repo/db"

export const tagsRouter = {
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
