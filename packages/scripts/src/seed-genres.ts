import { db } from "@repo/db";
import { genres } from "@repo/db/schema/index";
import { STEAM_APPIDS as APPIDS } from "./steam_appids"

type AppDetailsGenre = { id: string; description: string };

type AppDetailsEntry =
  | {
      success: true;
      data?: {
        genres?: AppDetailsGenre[];
      } | null;
    }
  | { success: false };

type AppDetailsResponse = Record<string, AppDetailsEntry | null>;

const APP_DETAILS_URL = "https://store.steampowered.com/api/appdetails";

// const APPIDS: number[] = [
//   730, // Counter-Strike 2
//   570, // Dota 2
//   440, // Team Fortress 2
//   578080, // PUBG: BATTLEGROUNDS
//   271590, // GTA V
//   1174180, // Red Dead Redemption 2
//   1091500, // Cyberpunk 2077
//   1086940, // Baldur's Gate 3
//   1245620, // ELDEN RING
//   292030, // The Witcher 3
//   105600, // Terraria
//   413150, // Stardew Valley
//   892970, // Valheim
//   740, // CS: Source (legacy)
//   620, // Portal 2
//   400, // Portal
//   220, // Half-Life 2
//   550, // Left 4 Dead 2
//   49520, // Borderlands 2
//   377160, // Fallout 4
//   22380, // Fallout: New Vegas
//   72850, // Skyrim
//   289070, // Civilization VI
//   8930, // Civilization V
//   236850, // Europa Universalis IV
//   281990, // Stellaris
//   394360, // Hearts of Iron IV
//   812140, // Assassin's Creed Odyssey
//   359550, // Rainbow Six Siege
//   252490, // Rust
//   346110, // ARK: Survival Evolved
//   945360, // Among Us
//   814380, // Sekiro
//   782330, // DOOM Eternal
//   379720, // DOOM (2016)
//   381210, // Dead by Daylight
//   239140, // Dying Light
//   739630, // Phasmophobia
//   105450, // Age of Empires III (legacy id varies by edition)
//   813780, // Age of Empires II: DE
//   1466860, // Age of Empires IV
//   1938090, // Call of Duty (HQ) (may vary; skipped if invalid)
//   976730, // Halo: The Master Chief Collection
//   582010, // Monster Hunter: World
//   1446780, // Monster Hunter Rise
//   1222670, // The Sims 4 (may vary; skipped if invalid)
//   391540, // Undertale
//   367520, // Hollow Knight
//   646570, // Slay the Spire
//   588650, // Dead Cells
//   250900, // The Binding of Isaac: Rebirth
//   1063730, // New World
//   1250410, // Microsoft Flight Simulator (may vary; skipped if invalid)
//   322330, // Don't Starve Together
//   264710, // Subnautica
//   648800, // Raft
//   594650, // Hunt: Showdown
//   433850, // H1Z1 (may be delisted/changed)
//   1097150, // Fall Guys (Steam availability may vary)
//   960090, // Bloons TD 6
//   1203220, // NARAKA: BLADEPOINT
//   1151640, // Horizon Zero Dawn Complete Edition
//   1240440, // Halo Infinite (may vary; skipped if invalid)
//   782330, // DOOM Eternal (dup safe)
//   1097840, // Gears 5
//   601150, // Devil May Cry 5
//   548430, // Deep Rock Galactic
//   552520, // Far Cry 5
//   311210, // Call of Duty: Black Ops III
//   874260, // BattleTech
//   268500, // XCOM 2
//   203140, // Hitman: Absolution
//   1659040, // HITMAN World of Assassination (may vary)
//   285160, // LEGO The Hobbit (example)
//   218620, // PAYDAY 2
//   632360, // Risk of Rain 2
//   1057090, // Ori and the Will of the Wisps
//   387290, // Ori and the Blind Forest: DE
//   1097420, // Persona 5 Royal
//   310950, // Street Fighter V
//   1364780, // Street Fighter 6
//   976310, // Mortal Kombat 11
//   1284210, // Guild Wars 2 (Steam)
//   238960, // Path of Exile
//   1172470, // Apex Legends (Steam)
//   1241100, // POLYGON (example)
//   431960, // Wallpaper Engine (software/non-game)
//   252950, // Rocket League (Steam delisted; will skip)
//   391220, // Rise of the Tomb Raider
//   750920, // Shadow of the Tomb Raider
//   524220, // NieR:Automata
//   221100, // DayZ
//   346110, // ARK (dup safe)
//   738540, // Tales of Arise
//   1817190, // Marvel's Spider-Man Remastered
//   1085660, // Destiny 2
//   594570, // Total War: WARHAMMER II
//   1142710, // Total War: WARHAMMER III
//   262060, // Darkest Dungeon
//   1217060, // Gunfire Reborn
//   1190460, // Death Stranding
//   1811260, // EA SPORTS FC 24 (may vary)
// ];

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
    headers: { "User-Agent": "steam-genres-script/1.0 (Node.js)" },
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

function mergeGenres(out: Map<string, string>, gs: AppDetailsGenre[] | undefined) {
  if (!Array.isArray(gs)) return;
  for (const g of gs) {
    const id = String(g.id);
    const description = g.description;

    if (!id || typeof description !== "string") continue;
    if (!out.has(id)) out.set(id, description);
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

  console.log("Fetching genres from Steam API...");
  console.log(`Options: cc=${opts.cc}, lang=${opts.lang}`);

  const ids = Array.from(new Set(APPIDS)).filter((n) => Number.isFinite(n));
  const genresById = new Map<string, string>();

  const batches = chunk(ids, Math.max(1, opts.batch));

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    // Try multi-fetch first (may fail/return null for multi-app requests)
    const multi = await fetchAppDetailsMulti(batch, opts.cc, opts.lang);

    if (multi) {
      for (const appid of batch) {
        const entry = multi[String(appid)];
        if (!entry || entry === null || entry.success !== true) continue;
        mergeGenres(genresById, entry.data?.genres);
      }
    } else {
      // Reliable fallback: single-app calls
      for (const appid of batch) {
        const entry = await fetchAppDetailsSingle(appid, opts.cc, opts.lang);
        if (entry && entry.success === true) {
          mergeGenres(genresById, entry.data?.genres);
        }
        if (opts.delayMs > 0) await sleep(opts.delayMs);
      }
    }

    if (opts.delayMs > 0) await sleep(opts.delayMs);

    process.stdout.write(
      `Processed ${i + 1}/${batches.length} | unique genres: ${genresById.size}\n`,
    );
  }

  console.log(`\nFetched ${genresById.size} unique genres.`);
  console.log("Inserting into database...");

  const genresToInsert = Array.from(genresById.entries()).map(
    ([steamId, name]) => ({
      steamId: Number.parseInt(steamId),
      name,
    }),
  );
      name,
    }),
  );

  let inserted = 0;
  let skipped = 0;

  try {
    const result = await db
      .insert(genres)
      .values(genresToInsert)
      .onConflictDoNothing()
      .returning({ steamId: genres.steamId });
    
    inserted = result.length;
    skipped = genresToInsert.length - inserted;
  } catch (error) {
    console.error("Error inserting genres:", error);
    process.exit(1);
  }

  console.log("\nCompleted!");
  console.log(`- Inserted: ${inserted}`);
  console.log(`- Skipped (duplicates): ${skipped}`);
  console.log(`- Total: ${genresById.size}`);

  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});