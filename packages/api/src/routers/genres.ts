import { ORPCError } from "@orpc/server";
import { db } from "@repo/db";
import { genres } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { eq } from "@repo/db"

export const genresRouter = {
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
