import { ORPCError } from "@orpc/server";
import { db } from "@repo/db";
import { tags } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";

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
				console.error("Error creating tag:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Tags",
				});
			}
		}),
};
