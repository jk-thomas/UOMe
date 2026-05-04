import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { openDb } from "../src/db/database.js";

describe("database schema", () => {
  let db;

  beforeAll(async () => {
    db = await openDb(":memory:");
  });

  afterAll(async () => {
    await db.close();
  });

  it("creates the core tables", async () => {
    const tables = await db.all(
      "SELECT name FROM sqlite_master WHERE type = 'table'"
    );
    const tableNames = tables.map((table) => table.name);

    expect(tableNames).toEqual(
      expect.arrayContaining(["users", "groups", "group_members", "expenses"])
    );
  });

  it("enforces foreign keys", async () => {
    const foreignKeys = await db.get("PRAGMA foreign_keys");
    expect(foreignKeys.foreign_keys).toBe(1);

    await expect(
      db.run(
        `INSERT INTO group_members(group_id, user_id)
         VALUES(?, ?)`,
        [999, 999]
      )
    ).rejects.toThrow();
  });
});
