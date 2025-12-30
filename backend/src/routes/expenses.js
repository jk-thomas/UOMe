import express from "express";
import { MEMBERS } from "../config/members.js";

function validAmount(amount) {
  return Number.isFinite(amount) && amount > 0 && amount <= 100000;
}

export function expensesRouter(db) {
  const router = express.Router();

  // List all expenses
  router.get("/", async (_req, res) => {
    const expenses = await db.all(
      `SELECT id, created_at, payer, amount_cents, description
       FROM expenses
       ORDER BY datetime(created_at) DESC, id DESC`
    );
    res.json({ members: MEMBERS, expenses });
  });

  // Add expense
  router.post("/", async (req, res) => {
    const { payer, amount, description = "" } = req.body ?? {};

    if (!MEMBERS.includes(payer))
      return res.status(400).json({ error: "Invalid payer" });

    if (!validAmount(amount))
      return res.status(400).json({ error: "Invalid amount" });

    if (description.length > 200)
      return res.status(400).json({ error: "Description too long" });

    const amount_cents = Math.round(amount * 100);

    const result = await db.run(
      `INSERT INTO expenses (payer, amount_cents, description)
       VALUES (?, ?, ?)`,
      payer,
      amount_cents,
      description.trim()
    );

    res.status(201).json({ id: result.lastID });
  });

  // Update expense (correction only)
  router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { payer, amount, description = "" } = req.body ?? {};

    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Invalid id" });

    if (!MEMBERS.includes(payer))
      return res.status(400).json({ error: "Invalid payer" });

    if (!validAmount(amount))
      return res.status(400).json({ error: "Invalid amount" });

    const amount_cents = Math.round(amount * 100);

    const result = await db.run(
      `UPDATE expenses
       SET payer = ?, amount_cents = ?, description = ?
       WHERE id = ?`,
      payer,
      amount_cents,
      description.trim(),
      id
    );

    if (result.changes === 0)
      return res.status(404).json({ error: "Expense not found" });

    res.json({ ok: true });
  });

  // Delete expense
  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Invalid id" });

    const result = await db.run(
      `DELETE FROM expenses WHERE id = ?`,
      id
    );

    if (result.changes === 0)
      return res.status(404).json({ error: "Expense not found" });

    res.json({ ok: true });
  });

  return router;
}
