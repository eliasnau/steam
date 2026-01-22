/**
 * Options:
 *   --limit <number>    Limit the number of games to process (default: 1000)
 *   --delayMs <number>  Delay between requests in milliseconds (default: 1000)
 *   --dry-run           Display tags without inserting into database
 */

import { db, sql } from "@repo/db";
import { game, gameToTags, tags } from "@repo/db/schema/index";

type SteamTag = {
	name: string;
	count: number;
};

function sleep(ms: number) {
	return new Promise((r) => setTimeout(r, ms));
}

/**
 * Scrape tags from Steam store page HTML
 * This parses the store page and extracts tags from the data-apptaginfo JSON
 */
async function fetchSteamTags(appid: number): Promise<SteamTag[]> {
	const url = `https://store.steampowered.com/app/${appid}/`;

	try {
		const res = await fetch(url, {
			headers: {
				"User-Agent": "Mozilla/5.0 (compatible; steam-tags-script/1.0)",
				Accept:
					"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
				"Accept-Language": "en-US,en;q=0.9",
			},
		});

		if (!res.ok) {
			console.error(`  ❌ HTTP ${res.status} for appid ${appid}`);
			return [];
		}

		const html = await res.text();

		// Extract tags from the glance_tags div
		// The tags are in <a> elements with class="app_tag"
		// Example: <a href="..." class="app_tag" ...>FPS</a>
		const tagMatches = html.matchAll(
			/<a[^>]*class="app_tag"[^>]*>\s*([^<]+)\s*<\/a>/g,
		);
		const tagsData: SteamTag[] = [];

		for (const match of tagMatches) {
			const tagName = match[1];
			if (!tagName) continue;

			const trimmedName = tagName.trim();
			if (trimmedName && trimmedName !== "+") {
				// Exclude the "+" add button
				tagsData.push({
					name: trimmedName,
					count: 0, // Count is not available in the HTML, only via data attributes
				});
			}
		}

		return tagsData;
	} catch (error) {
		console.error(
			`  ❌ Error fetching appid ${appid}:`,
			error instanceof Error ? error.message : String(error),
		);
		return [];
	}
}

/**
 * Find or create a tag in the database
 * Returns the tag ID
 */
async function findOrCreateTag(tagName: string): Promise<string> {
	// First, try to find existing tag (case-insensitive)
	const existing = await db
		.select({ id: tags.id, name: tags.name })
		.from(tags)
		.where(sql`LOWER(${tags.name}) = LOWER(${tagName})`)
		.limit(1);

	if (existing.length > 0 && existing[0]) {
		return existing[0].id;
	}

	// Tag doesn't exist, create it
	const result = await db
		.insert(tags)
		.values({ name: tagName })
		.returning({ id: tags.id });

	if (!result[0]) {
		throw new Error(`Failed to create tag: ${tagName}`);
	}

	return result[0].id;
}

/**
 * Link tags to a game via the game_to_tags junction table
 */
async function linkTagsToGame(
	gameId: string,
	tagIds: string[],
): Promise<number> {
	if (tagIds.length === 0) return 0;

	const values = tagIds.map((tagId) => ({
		gameId,
		tagId,
	}));

	const result = await db
		.insert(gameToTags)
		.values(values)
		.onConflictDoNothing()
		.returning({ gameId: gameToTags.gameId });

	return result.length;
}

function parseArgs(argv: string[]) {
	const args: Record<string, string> = {};
	for (let i = 2; i < argv.length; i++) {
		const a = argv[i];
		if (!a || !a.startsWith("--")) continue;
		const key = a.slice(2);
		const nextArg = argv[i + 1];
		const val = nextArg && !nextArg.startsWith("--") ? argv[++i] : "true";
		if (val) args[key] = val;
	}
	return {
		limit: args.limit ? Number(args.limit) : undefined,
		delayMs: Number(args.delayMs ?? "1000"),
		dryRun: args["dry-run"] === "true",
	};
}

async function main() {
	const opts = parseArgs(process.argv);

	console.log("Fetching games without tags from database...\n");

	// Find all games that don't have any tags
	// We do this by finding games whose ID is NOT in the gameToTags table
	const gamesWithoutTags = await db
		.select({
			id: game.id,
			steamId: game.steamId,
			name: game.name,
		})
		.from(game)
		.where(
			sql`NOT EXISTS (
				SELECT 1 FROM game_to_tags 
				WHERE game_to_tags.game_id = game.id
			)`,
		)
		.limit(opts.limit ?? 1000);

	console.log(`Found ${gamesWithoutTags.length} games without tags.\n`);

	if (gamesWithoutTags.length === 0) {
		console.log("✅ All games have tags!");
		process.exit(0);
	}

	console.log(
		`Fetching tags from Steam store pages (delay: ${opts.delayMs}ms)...\n`,
	);

	if (opts.dryRun) {
		console.log("🔍 DRY RUN MODE - Tags will NOT be inserted into database\n");
	}

	console.log("─".repeat(80));

	let successCount = 0;
	let emptyCount = 0;
	let totalTagsCreated = 0;
	let totalTagsLinked = 0;

	for (let i = 0; i < gamesWithoutTags.length; i++) {
		const gameRecord = gamesWithoutTags[i];
		if (!gameRecord) continue;

		console.log(
			`\n[${i + 1}/${gamesWithoutTags.length}] ${gameRecord.name} (${gameRecord.steamId})`,
		);

		const steamTags = await fetchSteamTags(gameRecord.steamId);

		if (steamTags.length === 0) {
			console.log("  ⚠️  No tags found");
			emptyCount++;
		} else {
			console.log(`  ✅ Found ${steamTags.length} tags:`);
			// Display tags
			const tagDisplay = steamTags
				.slice(0, 15) // Show top 15
				.map((t) => t.name)
				.join(", ");
			console.log(`     ${tagDisplay}`);
			if (steamTags.length > 15) {
				console.log(`     ... and ${steamTags.length - 15} more`);
			}

			if (!opts.dryRun) {
				// Insert tags and link to game
				console.log("  💾 Inserting tags into database...");

				const tagIds: string[] = [];
				let newTagsCount = 0;

				// Get existing tags first to track which are new
				const existingTagNames = new Set(
					(await db.select({ name: tags.name }).from(tags)).map((t) =>
						t.name.toLowerCase(),
					),
				);

				for (const tag of steamTags) {
					const isNew = !existingTagNames.has(tag.name.toLowerCase());
					const tagId = await findOrCreateTag(tag.name);
					tagIds.push(tagId);
					if (isNew) {
						newTagsCount++;
						existingTagNames.add(tag.name.toLowerCase());
					}
				}

				// Link tags to game
				const linkedCount = await linkTagsToGame(gameRecord.id, tagIds);

				console.log(
					`  ✅ Created ${newTagsCount} new tags, linked ${linkedCount} tags to game`,
				);

				totalTagsCreated += newTagsCount;
				totalTagsLinked += linkedCount;
			}

			successCount++;
		}

		// Rate limiting
		if (i < gamesWithoutTags.length - 1 && opts.delayMs > 0) {
			await sleep(opts.delayMs);
		}
	}

	console.log("\n" + "─".repeat(80));
	console.log("\n📊 Summary:");
	console.log(`  Total games processed: ${gamesWithoutTags.length}`);
	console.log(`  ✅ Games with tags found: ${successCount}`);
	console.log(`  ⚠️  Games with no tags: ${emptyCount}`);

	if (!opts.dryRun) {
		console.log(`  🆕 Total new tags created: ${totalTagsCreated}`);
		console.log(`  🔗 Total tag-game links created: ${totalTagsLinked}`);
	} else {
		console.log("\n💡 DRY RUN MODE - No changes were made to the database");
		console.log("   Run without --dry-run to insert tags into database");
	}

	process.exit(0);
}

main().catch((err) => {
	console.error("Error:", err);
	process.exit(1);
});
