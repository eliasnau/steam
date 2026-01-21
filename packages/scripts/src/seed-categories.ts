import { db } from "@repo/db";
import { categories } from "@repo/db/schema/index";
import { STEAM_APPIDS as APPIDS } from "./steam_appids"

type AppDetailsCategory = { id: number; description: string };

type AppDetailsEntry =
    | {
            success: true;
            data?: {
                categories?: AppDetailsCategory[];
            } | null;
      }
    | { success: false };

type AppDetailsResponse = Record<string, AppDetailsEntry | null>;

const APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails";

function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
}

async function fetchAppDetailsMulti(
    appids: number[],
    cc: string,
    lang: string,
): Promise<AppDetailsResponse | null> {
    const url = new URL(APP_DETAILS_URL);
    url.searchParams.set("appids", appids.join(","));
    url.searchParams.set("cc", cc);
    url.searchParams.set("l", lang);

    const res = await fetch(url.toString(), {
        headers: { "User-Agent": "steam-categories-script/1.0 (Node.js)" },
    });

    if (!res.ok) return null;

    const txt = await res.text();
    if (!txt || txt.trim() === "null") return null;

    try {
        return JSON.parse(txt) as AppDetailsResponse;
    } catch {
        return null;
    }
}

async function fetchAppDetailsSingle(
    appid: number,
    cc: string,
    lang: string,
): Promise<AppDetailsEntry | null> {
    const payload = await fetchAppDetailsMulti([appid], cc, lang);
    if (!payload) return null;
    const entry = payload[String(appid)];
    if (!entry || entry === null) return null;
    return entry;
}

function mergeCategories(
    out: Map<number, string>,
    cats: AppDetailsCategory[] | undefined,
) {
    if (!Array.isArray(cats)) return;
    for (const c of cats) {
        if (!Number.isFinite(c.id) || typeof c.description !== "string") continue;
        if (!out.has(c.id)) out.set(c.id, c.description);
    }
}

function chunk<T>(arr: T[], size: number): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

function parseArgs(argv: string[]) {
    const args: Record<string, string> = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (!a.startsWith("--")) continue;
        const key = a.slice(2);
        const val =
            argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : "true";
        args[key] = val;
    }
    return {
        cc: String(args.cc ?? "us"),
        lang: String(args.lang ?? "english"),
        batch: Number(args.batch ?? "20"),
        delayMs: Number(args.delayMs ?? "250"),
    };
}

async function main() {
    const opts = parseArgs(process.argv);

    console.log("Fetching categories from Steam API...");
    console.log(`Options: cc=${opts.cc}, lang=${opts.lang}`);

    console.log("Checking existing categories in database...");
    const existingCategories = await db
        .select({ steamId: categories.steamId })
        .from(categories);
    const existingIds = new Set(existingCategories.map(c => c.steamId));
    console.log(`Found ${existingIds.size} existing categories.`);

    const ids = Array.from(new Set(APPIDS)).filter((n) => Number.isFinite(n));
    const categoriesById = new Map<number, string>();

    const batches = chunk(ids, Math.max(1, opts.batch));

    for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];

        const multi = await fetchAppDetailsMulti(batch, opts.cc, opts.lang);

        if (multi) {
            for (const appid of batch) {
                const entry = multi[String(appid)];
                if (!entry || entry === null || entry.success !== true) continue;
                mergeCategories(categoriesById, entry.data?.categories);
            }
        } else {
            for (const appid of batch) {
                const entry = await fetchAppDetailsSingle(appid, opts.cc, opts.lang);
                if (entry && entry.success === true) {
                    mergeCategories(categoriesById, entry.data?.categories);
                }
                if (opts.delayMs > 0) await sleep(opts.delayMs);
            }
        }

        if (opts.delayMs > 0) await sleep(opts.delayMs);

        process.stdout.write(
            `Processed ${i + 1}/${batches.length} | unique categories: ${categoriesById.size}\n`,
        );
    }

    console.log(`\nFetched ${categoriesById.size} unique categories total.`);
    const newCategories = Array.from(categoriesById.entries())
        .filter(([id]) => !existingIds.has(id))
        .map(([id, description]) => ({
            steamId: id,
            name: description,
        }));

    console.log(`New categories to insert: ${newCategories.length}`);

    if (newCategories.length === 0) {
        console.log("No new categories to insert. Done!");
        process.exit(0);
    }

    console.log("Inserting new categories (bulk)...");
    const result = await db
        .insert(categories)
        .values(newCategories)
        .onConflictDoNothing()
        .returning({ steamId: categories.steamId });

    const inserted = result.length;
    console.log("\nCompleted!");
    console.log(`- Inserted (new): ${inserted}`);
    console.log(`- Already existed: ${newCategories.length - inserted}`);
    console.log(`- Total unique found: ${categoriesById.size}`);

    process.exit(0);
}

main().catch((err) => {
    console.error("Error:", err);
    process.exit(1);
});
