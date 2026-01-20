import { ORPCError } from "@orpc/server";
import { db } from "@repo/db";
import { operatingSystems } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import { eq } from "@repo/db"

export const operatingSystemsRouter = {
	getAll: publicProcedure.handler(async () => {
		const allOperatingSystems = await db.select().from(operatingSystems);
		return allOperatingSystems;
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
					.from(operatingSystems)
					.where(eq(operatingSystems.name, input.name.trim()))
					.limit(1);

				if (existing.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Dieses Betriebssystem existiert bereits.",
					});
				}

				const [newOperatingSystem] = await db
					.insert(operatingSystems)
					.values({
						name: input.name.trim(),
					})
					.returning();

				if (!newOperatingSystem) {
					throw new Error("Fehler beim Erstellen des Betriebssystems");
				}

				return {
					success: true,
					operatingSystem: newOperatingSystem,
				};
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				console.error("Error creating operating system:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Betriebssystems",
				});
			}
		}),
};
