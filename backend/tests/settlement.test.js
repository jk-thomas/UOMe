import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { openDb } from "../src/db/database.js";
import { expensesRouter } from "../src/routes/expenses.js";
import { groupsRouter } from "../src/routes/groups.js";
import { settlementRouter } from "../src/routes/settlement.js";
import { usersRouter } from "../src/routes/users.js";

function url(baseUrl, path) {
  return `${baseUrl}${path}`;
}

async function createUser(baseUrl, name) {
  const res = await fetch(url(baseUrl, "/api/users"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name })
  });
  const data = await res.json();
  return data.id;
}

describe("settlement route", () => {
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
    app.use("/api/settlement", settlementRouter(db));
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

  it("computes settlement per group using payer_id/user_id", async () => {
    const aliceId = await createUser(baseUrl, "Alice");
    const bobId = await createUser(baseUrl, "Bob");

    const createGroupRes = await fetch(url(baseUrl, "/api/groups"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Weekend", user_id: aliceId })
    });
    const createGroupData = await createGroupRes.json();
    const groupId = createGroupData.group_id;

    const joinRes = await fetch(url(baseUrl, `/api/groups/join/${createGroupData.join_code}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: bobId })
    });
    expect(joinRes.status).toBe(200);

    await fetch(url(baseUrl, "/api/expenses"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        group_id: groupId,
        payer_id: aliceId,
        amount_cents: 1000,
        description: "Groceries"
      })
    });

    const settlementRes = await fetch(url(baseUrl, `/api/settlement?group_id=${groupId}`));
    expect(settlementRes.status).toBe(200);
    const settlementData = await settlementRes.json();

    expect(settlementData.balances.Alice).toBe(500);
    expect(settlementData.balances.Bob).toBe(-500);
    expect(settlementData.transfers).toEqual([
      { from: "Bob", to: "Alice", amount_cents: 500 }
    ]);
  });
});
