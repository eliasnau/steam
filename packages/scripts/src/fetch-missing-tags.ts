import { db, sql } from "@repo/db";
import { game, gameToTags, tags } from "@repo/db/schema/index";
import { appendFile, writeFile } from "node:fs/promises";
import path from "node:path";

type GameRow = {
	id: string;
	steamId: number;
	name: string;
};

type FetchStatus = "ok" | "age_gate" | "http_error" | "network_error";

type FetchResult = {
	steamId: number;
	status: FetchStatus;
	tags: string[];
	httpStatus?: number;
	error?: string;
};

type ParsedArgs = {
	limit?: number;
	batchSize: number;
	requestsPerSecond: number;
	maxTagsPerGame: number;
	minTagsPerGame: number;
	ageGateFile: string;
	taggedGamesFile: string;
	insufficientTagsFile: string;
	birthtime: string;
	lastAgeCheckAge: string;
	wantsMatureContent: string;
	retries: number;
	dryRun: boolean;
};

function parseArgs(argv: string[]): ParsedArgs {
	const args: Record<string, string> = {};
	for (let i = 2; i < argv.length; i++) {
		const current = argv[i];
		if (!current || !current.startsWith("--")) continue;
		const key = current.slice(2);
		const next = argv[i + 1];
		const val = next && !next.startsWith("--") ? argv[++i] : "true";
		if (val) args[key] = val;
	}

	return {
		limit: args.limit ? Number(args.limit) : undefined,
		batchSize: Math.max(1, Number(args.batchSize ?? "10")),
		requestsPerSecond: Math.max(1, Number(args.requestsPerSecond ?? "5")),
		maxTagsPerGame: Math.max(1, Number(args.maxTagsPerGame ?? "20")),
		minTagsPerGame: Math.max(1, Number(args.minTagsPerGame ?? "1")),
		ageGateFile: String(args.ageGateFile ?? "steam-age-gated-steam-ids.txt"),
		taggedGamesFile: String(args.taggedGamesFile ?? "steam-tagged-games.csv"),
		insufficientTagsFile: String(
			args.insufficientTagsFile ?? "steam-insufficient-tags-games.csv",
		),
		birthtime: String(args.birthtime ?? "978303601"),
		lastAgeCheckAge: String(args.lastAgeCheckAge ?? "1-January-2001"),
		wantsMatureContent: String(args.wantsMatureContent ?? "1"),
		retries: Math.max(0, Number(args.retries ?? "2")),
		dryRun: args["dry-run"] === "true",
	};
}

function sleep(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function decodeHtml(text: string): string {
	return text
		.replaceAll("&amp;", "&")
		.replaceAll("&quot;", '"')
		.replaceAll("&#39;", "'")
		.replaceAll("&lt;", "<")
		.replaceAll("&gt;", ">")
		.replaceAll("&nbsp;", " ");
}

function normalizeWhitespace(text: string): string {
	return text.replace(/\s+/g, " ").trim();
}

function isAgeGatePage(html: string, finalUrl: string): boolean {
	if (finalUrl.includes("/agecheck/")) return true;
	if (finalUrl.includes("/agecheckset/")) return true;
	if (html.includes('id="agegate_box"')) return true;
	if (html.includes("Please enter your birth date to continue")) return true;
	return false;
}

function extractStoreTags(html: string, maxTagsPerGame: number): string[] {
	const tagsOut: string[] = [];
	const dedupe = new Set<string>();
	const re = /<a[^>]*class="[^"]*app_tag[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;

	for (const match of html.matchAll(re)) {
		const raw = match[1];
		if (!raw) continue;

		const withoutTags = raw.replace(/<[^>]+>/g, "");
		const cleaned = normalizeWhitespace(decodeHtml(withoutTags));
		if (!cleaned || cleaned === "+") continue;

		const key = cleaned.toLowerCase();
		if (dedupe.has(key)) continue;
		dedupe.add(key);
		tagsOut.push(cleaned);

		if (tagsOut.length >= maxTagsPerGame) break;
	}

	return tagsOut;
}

async function fetchSteamStoreTags(
	steamId: number,
	maxTagsPerGame: number,
	retries: number,
	cookieHeader: string,
): Promise<FetchResult> {
	const url = `https://store.steampowered.com/app/${steamId}/`;

	for (let attempt = 0; attempt <= retries; attempt++) {
		try {
			const response = await fetch(url, {
				headers: {
					"User-Agent": "Mozilla/5.0 (compatible; steam-store-tags/1.0)",
					Accept:
						"text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
					"Accept-Language": "en-US,en;q=0.9",
					Cookie: cookieHeader,
				},
				signal: AbortSignal.timeout(20_000),
			});

			if (!response.ok) {
				const result: FetchResult = {
					steamId,
					status: "http_error",
					tags: [],
					httpStatus: response.status,
				};
				if (attempt >= retries) return result;
				await sleep(250 * (attempt + 1));
				continue;
			}

			const html = await response.text();
			if (isAgeGatePage(html, response.url)) {
				return { steamId, status: "age_gate", tags: [] };
			}

			return {
				steamId,
				status: "ok",
				tags: extractStoreTags(html, maxTagsPerGame),
			};
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			if (attempt >= retries) {
				return {
					steamId,
					status: "network_error",
					tags: [],
					error: message,
				};
			}
			await sleep(250 * (attempt + 1));
		}
	}

	return {
		steamId,
		status: "network_error",
		tags: [],
		error: "Unexpected retry loop termination",
	};
}

function chunk<T>(arr: T[], size: number): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		out.push(arr.slice(i, i + size));
	}
	return out;
}

async function fetchBatchWithRateLimit(
	games: GameRow[],
	opts: ParsedArgs,
): Promise<Map<number, FetchResult>> {
	const spacingMs = Math.ceil(1000 / opts.requestsPerSecond);
	const cookieHeader = [
		`birthtime=${opts.birthtime}`,
		`lastagecheckage=${opts.lastAgeCheckAge}`,
		`wants_mature_content=${opts.wantsMatureContent}`,
	].join("; ");

	const promises = games.map(
		(gameRow, index) =>
			new Promise<FetchResult>((resolve) => {
				setTimeout(() => {
					void fetchSteamStoreTags(
						gameRow.steamId,
						opts.maxTagsPerGame,
						opts.retries,
						cookieHeader,
					).then(resolve);
				}, index * spacingMs);
			}),
	);

	const results = await Promise.all(promises);
	return new Map(results.map((result) => [result.steamId, result]));
}

async function loadExistingTagMap(): Promise<Map<string, string>> {
	const allTags = await db.select({ id: tags.id, name: tags.name }).from(tags);
	const byLowerName = new Map<string, string>();

	for (const tagRow of allTags) {
		const key = tagRow.name.toLowerCase();
		if (!byLowerName.has(key)) {
			byLowerName.set(key, tagRow.id);
		}
	}

	return byLowerName;
}

async function insertMissingTags(
	tagNames: string[],
	tagMap: Map<string, string>,
): Promise<number> {
	const missingNames = tagNames.filter((name) => !tagMap.has(name.toLowerCase()));
	if (missingNames.length === 0) return 0;

	const inserted = await db
		.insert(tags)
		.values(missingNames.map((name) => ({ name })))
		.returning({ id: tags.id, name: tags.name });

	for (const row of inserted) {
		tagMap.set(row.name.toLowerCase(), row.id);
	}

	return inserted.length;
}

async function persistBatch(
	games: GameRow[],
	fetchedBySteamId: Map<number, FetchResult>,
	tagMap: Map<string, string>,
	eligibleSteamIds: Set<number>,
): Promise<{ newTagsCreated: number; gameTagLinksInserted: number }> {
	const allTagNames = new Set<string>();

	for (const gameRow of games) {
		if (!eligibleSteamIds.has(gameRow.steamId)) continue;
		const fetched = fetchedBySteamId.get(gameRow.steamId);
		if (!fetched || fetched.status !== "ok") continue;
		for (const tagName of fetched.tags) allTagNames.add(tagName);
	}

	const newTagsCreated = await insertMissingTags(Array.from(allTagNames), tagMap);

	const rowsToLink: Array<{ gameId: string; tagId: string }> = [];
	for (const gameRow of games) {
		if (!eligibleSteamIds.has(gameRow.steamId)) continue;
		const fetched = fetchedBySteamId.get(gameRow.steamId);
		if (!fetched || fetched.status !== "ok" || fetched.tags.length === 0) continue;

		for (const tagName of fetched.tags) {
			const tagId = tagMap.get(tagName.toLowerCase());
			if (!tagId) continue;
			rowsToLink.push({ gameId: gameRow.id, tagId });
		}
	}

	if (rowsToLink.length === 0) {
		return { newTagsCreated, gameTagLinksInserted: 0 };
	}

	const insertedLinks = await db
		.insert(gameToTags)
		.values(rowsToLink)
		.onConflictDoNothing()
		.returning({ gameId: gameToTags.gameId });

	return { newTagsCreated, gameTagLinksInserted: insertedLinks.length };
}

async function appendAgeGateIds(filePath: string, ids: number[]) {
	if (ids.length === 0) return;
	const lines = ids.map((id) => `${id}\n`).join("");
	await appendFile(filePath, lines, "utf8");
}

function escapeCsv(value: string | number): string {
	const raw = String(value);
	const escaped = raw.replaceAll('"', '""');
	return `"${escaped}"`;
}

async function appendTaggedGamesCsv(
	filePath: string,
	games: GameRow[],
	fetchedBySteamId: Map<number, FetchResult>,
	eligibleSteamIds: Set<number>,
) {
	const lines: string[] = [];

	for (const gameRow of games) {
		if (!eligibleSteamIds.has(gameRow.steamId)) continue;
		const fetched = fetchedBySteamId.get(gameRow.steamId);
		if (!fetched || fetched.status !== "ok" || fetched.tags.length === 0) continue;

		for (const tag of fetched.tags) {
			lines.push(
				[
					escapeCsv(gameRow.name),
					escapeCsv(gameRow.id),
					escapeCsv(tag),
					escapeCsv(gameRow.steamId),
				].join(","),
			);
		}
	}

	if (lines.length > 0) {
		await appendFile(filePath, `${lines.join("\n")}\n`, "utf8");
	}
}

async function appendInsufficientTagsCsv(
	filePath: string,
	rows: Array<{
		game: GameRow;
		tagCount: number;
		tags: string[];
	}>,
) {
	if (rows.length === 0) return;

	const lines = rows.map(({ game, tagCount, tags }) =>
		[
			escapeCsv(game.name),
			escapeCsv(game.id),
			escapeCsv(game.steamId),
			escapeCsv(tagCount),
			escapeCsv(tags.join("|")),
		].join(","),
	);

	await appendFile(filePath, `${lines.join("\n")}\n`, "utf8");
}

async function main() {
	const opts = parseArgs(process.argv);
	const ageGateFile = path.resolve(process.cwd(), opts.ageGateFile);
	const taggedGamesFile = path.resolve(process.cwd(), opts.taggedGamesFile);
	const insufficientTagsFile = path.resolve(
		process.cwd(),
		opts.insufficientTagsFile,
	);

	await writeFile(ageGateFile, "", "utf8");
	await writeFile(taggedGamesFile, "name,id,tag,steamId\n", "utf8");
	await writeFile(insufficientTagsFile, "name,id,steamId,tagCount,tags\n", "utf8");

	console.log("Finding games without tags...");
	const missingTagGames = await db
		.select({ id: game.id, steamId: game.steamId, name: game.name })
		.from(game)
		.where(
			sql`NOT EXISTS (
				SELECT 1
				FROM game_to_tags
				WHERE game_to_tags.game_id = game.id
			)`,
		)
		.limit(opts.limit ?? Number.MAX_SAFE_INTEGER);

	if (missingTagGames.length === 0) {
		console.log("No games without tags were found.");
		console.log(`Age-gated IDs file initialized at: ${ageGateFile}`);
		console.log(`Tagged games CSV initialized at: ${taggedGamesFile}`);
		console.log(`Insufficient tags CSV initialized at: ${insufficientTagsFile}`);
		return;
	}

	console.log(`Games without tags: ${missingTagGames.length}`);
	console.log(
		`Options: batchSize=${opts.batchSize}, requestsPerSecond=${opts.requestsPerSecond}, maxTagsPerGame=${opts.maxTagsPerGame}, minTagsPerGame=${opts.minTagsPerGame}, retries=${opts.retries}, dryRun=${opts.dryRun}`,
	);
	console.log(
		`Age cookie config: birthtime=${opts.birthtime}, lastagecheckage=${opts.lastAgeCheckAge}, wants_mature_content=${opts.wantsMatureContent}`,
	);
	console.log(`Age-gated IDs file: ${ageGateFile}`);
	console.log(`Tagged games CSV: ${taggedGamesFile}`);
	console.log(`Insufficient tags CSV: ${insufficientTagsFile}`);

	const batches = chunk(missingTagGames, opts.batchSize);
	const tagMap = opts.dryRun ? new Map<string, string>() : await loadExistingTagMap();

	let totalAgeGated = 0;
	let totalGamesWithParsedTags = 0;
	let totalTagNamesParsed = 0;
	let totalHttpErrors = 0;
	let totalNetworkErrors = 0;
	let totalInsufficientTagGames = 0;
	let totalNewTagsCreated = 0;
	let totalLinksInserted = 0;

	for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
		const batch = batches[batchIndex];
		if (!batch) continue;

		console.log(`\nBatch ${batchIndex + 1}/${batches.length} (${batch.length} games)`);
		const fetched = await fetchBatchWithRateLimit(batch, opts);

		const ageGatedIds: number[] = [];
		const eligibleSteamIds = new Set<number>();
		const insufficientRows: Array<{
			game: GameRow;
			tagCount: number;
			tags: string[];
		}> = [];

		for (const gameRow of batch) {
			const result = fetched.get(gameRow.steamId);
			if (!result) continue;

			if (result.status === "age_gate") {
				ageGatedIds.push(gameRow.steamId);
				totalAgeGated++;
				continue;
			}
			if (result.status === "http_error") {
				totalHttpErrors++;
				continue;
			}
			if (result.status === "network_error") {
				totalNetworkErrors++;
				continue;
			}

			if (result.tags.length > 0) {
				totalGamesWithParsedTags++;
				totalTagNamesParsed += result.tags.length;
			}

			if (result.tags.length < opts.minTagsPerGame) {
				insufficientRows.push({
					game: gameRow,
					tagCount: result.tags.length,
					tags: result.tags,
				});
				totalInsufficientTagGames++;
				continue;
			}

			eligibleSteamIds.add(gameRow.steamId);
		}

		await appendAgeGateIds(ageGateFile, ageGatedIds);
		await appendInsufficientTagsCsv(insufficientTagsFile, insufficientRows);

		if (opts.dryRun) {
			console.log(
				`Parsed tags for ${batch.filter((g) => (fetched.get(g.steamId)?.tags.length ?? 0) > 0).length} games in this batch (dry-run).`,
			);
			continue;
		}

		const persisted = await persistBatch(batch, fetched, tagMap, eligibleSteamIds);
		await appendTaggedGamesCsv(taggedGamesFile, batch, fetched, eligibleSteamIds);
		totalNewTagsCreated += persisted.newTagsCreated;
		totalLinksInserted += persisted.gameTagLinksInserted;

		console.log(
			`Persisted batch: +${persisted.newTagsCreated} tags, +${persisted.gameTagLinksInserted} game-tag links, age-gated=${ageGatedIds.length}, insufficient=${insufficientRows.length}`,
		);
	}

	console.log("\nDone.");
	console.log(`- Processed games: ${missingTagGames.length}`);
	console.log(`- Games with parsed tags: ${totalGamesWithParsedTags}`);
	console.log(`- Parsed tag assignments: ${totalTagNamesParsed}`);
	console.log(`- Age-gated games: ${totalAgeGated}`);
	console.log(`- HTTP errors: ${totalHttpErrors}`);
	console.log(`- Network errors: ${totalNetworkErrors}`);
	console.log(`- Insufficient tag games (<${opts.minTagsPerGame}): ${totalInsufficientTagGames}`);
	if (!opts.dryRun) {
		console.log(`- New tags created: ${totalNewTagsCreated}`);
		console.log(`- Game-tag links inserted: ${totalLinksInserted}`);
	}
	console.log(`- Age-gated IDs file: ${ageGateFile}`);
	console.log(`- Tagged games CSV: ${taggedGamesFile}`);
	console.log(`- Insufficient tags CSV: ${insufficientTagsFile}`);
}

main().catch((error) => {
	console.error("Script failed:", error);
	process.exit(1);
});
