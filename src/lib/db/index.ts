import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schemas";
import { env } from "@/lib/env";

const pool = new Pool({
    connectionString: env.POSTGRES_URL,
});

const db = drizzle(pool, { schema });
export default db;
