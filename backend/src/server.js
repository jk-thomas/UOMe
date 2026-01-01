import "dotenv/config";
import express from "express";
import cors from "cors";
import { openDb } from "./db/database.js";
import { expensesRouter } from "./routes/expenses.js";
import { settlementRouter } from "./routes/settlement.js";

const PORT = Number(process.env.PORT ?? 3001);
const DB_FILE = process.env.DB_FILE ?? "./data/expenses.sqlite";
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "*";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(cors({ origin: CORS_ORIGIN === "*" ? true : CORS_ORIGIN }));

const db = await openDb(DB_FILE);

app.get("/api/health", (_, res) => res.json({ ok: true }));
app.use("/api/expenses", expensesRouter(db));
app.use("/api/settlement", settlementRouter(db));

app.listen(PORT, () => { //"0.0.0.0,"
  console.log(`Backend running on port ${PORT}`);
});
