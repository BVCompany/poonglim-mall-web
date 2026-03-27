import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  connect_timeout: 10,
  idle_timeout: 20,
  max_lifetime: 60 * 5,
});

const db = drizzle({ client });

export default db;
