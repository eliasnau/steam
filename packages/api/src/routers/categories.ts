import { ORPCError } from "@orpc/server";
import { db, eq } from "@repo/db";
import { categories } from "@repo/db/schema/index";
import { z } from "zod";
import { protectedProcedure, publicProcedure } from "../index";

export const categoriesRouter = {
	getAll: publicProcedure.handler(async () => {
		const allCategories = await db.select().from(categories);
		return allCategories;
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
					.from(categories)
					.where(eq(categories.name, input.name.trim()))
					.limit(1);

				if (existing.length > 0) {
					throw new ORPCError("BAD_REQUEST", {
						message: "Diese Kategorie existiert bereits.",
					});
				}
				const [newCategory] = await db
					.insert(categories)
					.values({
						name: input.name.trim(),
					})
					.returning();

				if (!newCategory) {
					throw new Error("Fehler beim Erstellen des Features");
				}

				return {
					success: true,
					category: newCategory,
				};
			} catch (error) {
				if (error instanceof ORPCError) throw error;
				console.error("Error creating category:", error);

				throw new ORPCError("INTERNAL_SERVER_ERROR", {
					message: "Fehler beim Erstellen des Features",
				});
			}
		}),
};
