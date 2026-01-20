import { ORPCError } from "@orpc/server";
import { db } from "@repo/db";
import { genres } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";

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
				console.error("Error creating genre:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Genre",
				});
			}
		}),
};
