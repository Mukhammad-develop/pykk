// src/scripts/migrate.ts
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
var here = path.dirname(fileURLToPath(import.meta.url));
try {
  process.loadEnvFile(path.join(here, ".env"));
} catch {
}
var url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set (looked in .env next to this script and in the environment)");
  process.exit(1);
}
var migrationsFolder = path.join(here, "drizzle");
if (!fs.existsSync(migrationsFolder)) {
  console.error(`Migrations folder not found: ${migrationsFolder}`);
  process.exit(1);
}
var connection = await mysql.createConnection(url);
try {
  await migrate(drizzle(connection), { migrationsFolder });
  console.log("\u2714 Migrations applied");
} finally {
  await connection.end();
}
