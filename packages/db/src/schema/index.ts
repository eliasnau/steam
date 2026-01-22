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
} from "drizzle-orm/pg-core";

export const game = pgTable("game", {
	id: text("id").primaryKey().default(sql`nanoid_12()`),

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

	franchiseId: text("franchise_id").references(() => franchises.id),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const franchises = pgTable("franchises", {
	id: text("id").primaryKey().default(sql`nanoid_12()`),
	name: text("name").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const categories = pgTable("categories", {
	id: text("id").primaryKey().default(sql`nanoid_12()`),

	steamId: integer("steam_id").unique().notNull(),
	name: text("name").notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const operatingSystems = pgTable("operating_systems", {
	id: text("id").primaryKey().default(sql`nanoid_12()`),

	name: text("name").notNull(),
	popularity: decimal("popularity"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const genres = pgTable("genres", {
	id: text("id").primaryKey().default(sql`nanoid_12()`),

	name: text("name").notNull(),
	steamId: integer("steam_id").unique().notNull(),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const publishers = pgTable("publishers", {
	id: text("id").primaryKey().default(sql`nanoid_12()`),

	name: text("name").notNull(),
	teamSize: text("team_size"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const developers = pgTable("developers", {
	id: text("id").primaryKey().default(sql`nanoid_12()`),

	name: text("name").notNull(),
	teamSize: text("team_size"),

	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
});

export const tags = pgTable("tags", {
	id: text("id").primaryKey().default(sql`nanoid_12()`),

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
		gameId: text("game_id")
			.notNull()
			.references(() => game.id),
		genreId: text("genre_id")
			.notNull()
			.references(() => genres.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.genreId] })],
);

export const gameToCategories = pgTable(
	"game_to_categories",
	{
		gameId: text("game_id")
			.notNull()
			.references(() => game.id),
		categoryId: text("category_id")
			.notNull()
			.references(() => categories.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.categoryId] })],
);

export const gameToOperatingSystems = pgTable(
	"game_to_operating_systems",
	{
		gameId: text("game_id")
			.notNull()
			.references(() => game.id),
		operatingSystemId: text("operating_system_id")
			.notNull()
			.references(() => operatingSystems.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.operatingSystemId] })],
);

export const publishersToGame = pgTable(
	"publisher_to_game",
	{
		gameId: text("game_id")
			.notNull()
			.references(() => game.id),
		publisherId: text("publisher_id")
			.notNull()
			.references(() => publishers.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.publisherId] })],
);

export const gameToDevelopers = pgTable(
	"game_to_developers",
	{
		gameId: text("game_id")
			.notNull()
			.references(() => game.id),
		developerId: text("developer_id")
			.notNull()
			.references(() => developers.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.developerId] })],
);

export const gameToTags = pgTable(
	"game_to_tags",
	{
		gameId: text("game_id")
			.notNull()
			.references(() => game.id),
		tagId: text("tag_id")
			.notNull()
			.references(() => tags.id),
	},
	(table) => [primaryKey({ columns: [table.gameId, table.tagId] })],
);
