import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { openDb } from "../src/db/database.js";
import { groupsRouter } from "../src/routes/groups.js";
import { usersRouter } from "../src/routes/users.js";

function url(baseUrl, path) {
  return `${baseUrl}${path}`;
}

describe("groups routes", () => {
  let db;
  let server;
  let baseUrl;

  beforeAll(async () => {
    db = await openDb(":memory:");
    const app = express();
    app.use(express.json());
    app.use("/api/users", usersRouter(db));
    app.use("/api/groups", groupsRouter(db));
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

  it("creates groups with generated unique tokens and supports join", async () => {
    const createUser = await fetch(url(baseUrl, "/api/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Alice" })
    });
    const { id: aliceId } = await createUser.json();

    const createGroupA = await fetch(url(baseUrl, "/api/groups"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Group A", user_id: aliceId })
    });
    expect(createGroupA.status).toBe(200);
    const groupA = await createGroupA.json();

    const createGroupB = await fetch(url(baseUrl, "/api/groups"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Group B", user_id: aliceId })
    });
    expect(createGroupB.status).toBe(200);
    const groupB = await createGroupB.json();

    expect(groupA.join_code).toBeTypeOf("string");
    expect(groupA.join_code.length).toBeGreaterThan(0);
    expect(groupA.join_code).not.toBe(groupB.join_code);

    const createBob = await fetch(url(baseUrl, "/api/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Bob" })
    });
    const { id: bobId } = await createBob.json();

    const joinRes = await fetch(url(baseUrl, `/api/groups/join/${groupA.join_code}`), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: bobId })
    });
    expect(joinRes.status).toBe(200);
    const joinData = await joinRes.json();
    expect(joinData.group_id).toBe(groupA.group_id);

    const invalidJoin = await fetch(url(baseUrl, "/api/groups/join/not-a-real-token"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: bobId })
    });
    expect(invalidJoin.status).toBe(404);
    const invalidData = await invalidJoin.json();
    expect(invalidData.error).toBe("Invalid token");
  });
});
