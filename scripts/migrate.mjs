import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing.");
const sql = neon(process.env.DATABASE_URL);
const schema = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");
const statements = schema.split(";").map((statement) => statement.trim()).filter(Boolean);
for (const statement of statements) await sql.query(statement);
const [{ count }] = await sql`select count(*)::int as count from roasts`;
console.log(`Neon leaderboard ready (${count} existing rows).`);
