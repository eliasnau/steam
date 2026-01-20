export * from "./auth";
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  decimal,
  date,
  integer,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

export const game = pgTable("game", {
  id: uuid("id").defaultRandom().primaryKey(),

  steamId: text("steam_id").notNull(),
  name: text("name").notNull(),
  price: decimal("price").notNull(),
  releasedAt: date("released_at").notNull(),
  playerCountAllTime: integer("player_count_all_time").notNull(),
  rating: text("rating").notNull(),
  image: text("image"),

  franchiseId: integer("franchise_id").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const achievements = pgTable("achievements", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),
  description: text("description"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),

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
  popularity: decimal("popularity").notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export const genres = pgTable("genres", {
  id: uuid("id").defaultRandom().primaryKey(),

  name: text("name").notNull(),

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

export const gameToAchievements = pgTable(
  "game_to_achievements",
  {
    gameId: uuid("game_id")
      .notNull()
      .references(() => game.id),
    achievementId: uuid("achievement_id")
      .notNull()
      .references(() => achievements.id),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.achievementId] })],
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