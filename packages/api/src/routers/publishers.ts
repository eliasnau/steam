import { ORPCError } from "@orpc/server";
import { db } from "@repo/db";
import { publishers } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { eq } from "@repo/db"

export const publishersRouter = {
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
					.where(eq(publishers.name, input.name))
					.limit(1);

				if (existing.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Dieser Publisher existiert bereits.",
					});
				}
				const [newPublisher] = await db
					.insert(publishers)
					.values({
						name: input.name,
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
				console.error("Error creating publisher:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Publishers",
				});
			}
		}),
};

