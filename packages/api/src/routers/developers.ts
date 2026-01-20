import { ORPCError } from "@orpc/server";
import { db } from "@repo/db";
import { developers } from "@repo/db/schema/index";
import {eq} from "@repo/db"
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";

export const developersRouter = {
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

