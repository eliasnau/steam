import { neon, neonConfig } from "@neondatabase/serverless";
import { Pool } from "@neondatabase/serverless";
import { env } from "@repo/env/server";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";

import * as schema from "./schema";

neonConfig.webSocketConstructor = ws;

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool, { schema, casing: "snake_case" });

export { and, eq, inArray, not, or, sql as sqlOperator } from "drizzle-orm";
