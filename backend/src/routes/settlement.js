import express from "express";
import { computeSettlement } from "../services/settlement.js";
import { MEMBERS } from "../config/members.js";

export function settlementRouter(db) {
  const router = express.Router();

  router.get("/", async (_req, res) => {
    const expenses = await db.all(
      `SELECT payer, amount_cents FROM expenses`
    );
    const result = computeSettlement(expenses);
    res.json({ members: MEMBERS, ...result });
  });

  return router;
}
