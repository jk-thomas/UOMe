import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { openDb } from "../src/db/database.js";
import { expensesRouter } from "../src/routes/expenses.js";
import { groupsRouter } from "../src/routes/groups.js";
import { usersRouter } from "../src/routes/users.js";

function url(baseUrl, path) {
  return `${baseUrl}${path}`;
}

describe("expenses route", () => {
  let db;
  let server;
  let baseUrl;

  beforeAll(async () => {
    db = await openDb(":memory:");
    const app = express();
    app.use(express.json());
    app.use("/api/users", usersRouter(db));
    app.use("/api/groups", groupsRouter(db));
    app.use("/api/expenses", expensesRouter(db));
    server = app.listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterAll(async () => {
    await db.close();
    await new Promise((resolve, reject) =>
      server.close((err) => (err ? reject(err) : resolve()))
    );
  });

  it("adds and lists expenses scoped by group_id", async () => {
    const userRes = await fetch(url(baseUrl, "/api/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice" })
    });
    expect(userRes.status).toBe(200);
    const { id: userId } = await userRes.json();

    const groupRes = await fetch(url(baseUrl, "/api/groups"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Trip", user_id: userId })
    });
    const { group_id: groupId } = await groupRes.json();

    const addRes = await fetch(url(baseUrl, "/api/expenses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: groupId,
        payer_id: userId,
        amount_cents: 1200,
        description: "Dinner"
      })
    });
    expect(addRes.status).toBe(201);

    const listRes = await fetch(url(baseUrl, `/api/expenses?group_id=${groupId}`));
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(listData.expenses).toHaveLength(1);
    expect(listData.expenses[0].amount_cents).toBe(1200);
    expect(listData.expenses[0].payer_id).toBe(userId);
  });
});
