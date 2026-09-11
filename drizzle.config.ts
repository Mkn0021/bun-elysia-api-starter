import { env } from "./src/lib/env";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: "./src/lib/db/schemas",
    out: "./src/lib/db/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: env.POSTGRES_URL,
    },
});
