export * from "./auth";

import { relations, sql } from "drizzle-orm";
import {
	check,
	date,
	decimal,
	integer,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";

export const game = pgTable(
	"game",
	{
		id: uuid("id").defaultRandom().primaryKey(),

		steamId: integer("steam_id").unique().notNull(),
		name: text("name").notNull(),
		price: decimal("price"),
		releasedAt: date("released_at").notNull(),
		positiveReviews: integer("positive_reviews").notNull(),
        negativeReviews: integer("negative_reviews").notNull(),
		image: text("image"),
		shortDescription: text("short_description"),
		website: text("website"),
		createdBy: text("created_by"),

		franchiseId: uuid("franchise_id").references(() => franchises.id),

		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
    });

export const franchises = pgTable("franchises", {
	id: uuid("id").defaultRandom().primaryKey(),
	name: text("name").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const categories = pgTable("categories", {
	id: uuid("id").defaultRandom().primaryKey(),

	steamId: integer("steam_id").unique().notNull(),
	name: text("name").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const operatingSystems = pgTable("operating_systems", {
	id: uuid("id").defaultRandom().primaryKey(),

	name: text("name").notNull(),
	popularity: decimal("popularity"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const genres = pgTable("genres", {
	id: uuid("id").defaultRandom().primaryKey(),

	name: text("name").notNull(),
	steamId: integer("steam_id").unique().notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const publishers = pgTable("publishers", {
	id: uuid("id").defaultRandom().primaryKey(),

	name: text("name").notNull(),
	teamSize: text("team_size"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const developers = pgTable("developers", {
	id: uuid("id").defaultRandom().primaryKey(),

	name: text("name").notNull(),
	teamSize: text("team_size"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const tags = pgTable("tags", {
	id: uuid("id").defaultRandom().primaryKey(),

	name: text("name").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const gameToGenres = pgTable(
	"game_to_genres",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => game.id),
		genreId: uuid("genre_id")
			.notNull()
			.references(() => genres.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.genreId] })],
);

export const gameToCategories = pgTable(
	"game_to_categories",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => game.id),
		categoryId: uuid("category_id")
			.notNull()
			.references(() => categories.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.categoryId] })],
);

export const gameToOperatingSystems = pgTable(
	"game_to_operating_systems",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => game.id),
		operatingSystemId: uuid("operating_system_id")
			.notNull()
			.references(() => operatingSystems.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.operatingSystemId] })],
);

export const publishersToGame = pgTable(
	"publisher_to_game",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => game.id),
		publisherId: uuid("publisher_id")
			.notNull()
			.references(() => publishers.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.publisherId] })],
);

export const gameToDevelopers = pgTable(
	"game_to_developers",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => game.id),
		developerId: uuid("developer_id")
			.notNull()
			.references(() => developers.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.developerId] })],
);

export const gameToTags = pgTable(
	"game_to_tags",
	{
		gameId: uuid("game_id")
			.notNull()
			.references(() => game.id),
		tagId: uuid("tag_id")
			.notNull()
			.references(() => tags.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.tagId] })],
);
