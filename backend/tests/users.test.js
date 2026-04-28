import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { openDb } from "../src/db/database.js";
import { usersRouter } from "../src/routes/users.js";

function url(baseUrl, path) {
  return `${baseUrl}${path}`;
}

describe("users routes", () => {
  let db;
  let server;
  let baseUrl;

  beforeAll(async () => {
    db = await openDb(":memory:");
    const app = express();
    app.use(express.json());
    app.use("/api/users", usersRouter(db));
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

  it("creates and lists users", async () => {
    const createRes = await fetch(url(baseUrl, "/api/users"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test User" })
    });
    expect(createRes.status).toBe(200);
    const createData = await createRes.json();
    expect(createData.id).toBeTypeOf("number");

    const listRes = await fetch(url(baseUrl, "/api/users"));
    expect(listRes.status).toBe(200);
    const listData = await listRes.json();
    expect(Array.isArray(listData.users)).toBe(true);
    expect(listData.users.some((u) => u.name === "Test User")).toBe(true);
  });
});
