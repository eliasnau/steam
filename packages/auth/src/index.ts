import { db } from "@repo/db";
import * as schema from "@repo/db/schema/auth";
import { env } from "@repo/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin as adminPlugin } from "better-auth/plugins"
import { ac, admin, user, maintainer } from "./permissions"

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [env.CORS_ORIGIN],
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    adminPlugin({
      ac,
      defaultRole: "user",
      roles: {
        admin,
        // user,
        maintainer
      }
    }),
    nextCookies()],
});
