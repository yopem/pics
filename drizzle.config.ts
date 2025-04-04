import { defineConfig, type Config } from "drizzle-kit"

import { env } from "@/env"

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/server/db/schema",
  out: "./src/server/db/migrations",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
}) satisfies Config
