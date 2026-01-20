import { ORPCError } from "@orpc/server";
import { db } from "@repo/db";
import { franchises } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";
import {eq} from "@repo/db"

export const franchisesRouter = {
	getAll: publicProcedure.handler(async () => {
		const allFranchises = await db.select().from(franchises);
		return allFranchises;
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
					.from(franchises)
					.where(eq(franchises.name, input.name.trim()))
					.limit(1);

				if (existing.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Dieses Franchise existiert bereits.",
					});
				}
				const [newFranchise] = await db
					.insert(franchises)
					.values({
						name: input.name.trim(),
					})
					.returning();

				if (!newFranchise) {
					throw new Error("Fehler beim Erstellen des Franchise");
				}

				return {
					success: true,
					franchise: newFranchise,
				};
			} catch (error) {
				console.error("Error creating franchise:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Franchise",
				});
			}
		}),
};
