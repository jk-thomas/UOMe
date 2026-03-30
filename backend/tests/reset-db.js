import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

// "test": "npm run reset-db && node tests/expenses.test.js && node tests/settlement.test.js"

const DB_FILE = process.env.DB_FILE ?? "./data/expenses.sqlite";

async function resetDb() {
  const dbPath = path.resolve(DB_FILE);

  // Delete existing DB file if it exists
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
    console.log("🧹 Deleted existing DB");
  }

  // Recreate DB and schema
  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  const schema = fs.readFileSync(
    new URL("../src/db/schema.sql", import.meta.url),
    "utf8"
  );

  await db.exec(schema);
  await db.close();

  console.log("✅ Database reset complete");
}

resetDb().catch(err => {
  console.error("❌ Failed to reset DB", err);
  process.exit(1);
});
