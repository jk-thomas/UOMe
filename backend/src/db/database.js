import fs from "node:fs";
import path from "node:path";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

export async function openDb(dbFile) {
  const dir = path.dirname(dbFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = await open({
    filename: dbFile,
    driver: sqlite3.Database
  });

  const schema = fs.readFileSync(
    new URL("./schema.sql", import.meta.url),
    "utf8"
  );
  await db.exec(schema);

  return db;
}
