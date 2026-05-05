// backend/src/db/migrate.ts
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { db } from "./index.js";

migrate(db, { migrationsFolder: "./drizzle" });

console.log("Migration done");