import express from "express";

export function expensesRouter(db) {
  const router = express.Router();

  // List all expenses
  router.get("/", async (req, res) => {
    const groupId = Number(req.query.group_id);
    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ error: "group_id is required" });
    }

    const expenses = await db.all(
      `SELECT e.id, e.group_id, e.payer_id, u.name AS payer_name, e.amount_cents, e.description, e.created_at
       FROM expenses e
       JOIN users u ON u.id = e.payer_id
       WHERE e.group_id = ?
       ORDER BY datetime(e.created_at) DESC, e.id DESC`,
      [groupId]
    );
    res.json({ expenses });
  });

  // Add expense
  router.post("/", async (req, res) => {
    const { group_id, payer_id, amount_cents, description = "" } = req.body ?? {};
    const groupId = Number(group_id);
    const payerId = Number(payer_id);
    const amountCents = Number(amount_cents);

    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ error: "group_id is required" });
    }
    if (!Number.isInteger(payerId)) {
      return res.status(400).json({ error: "payer_id is required" });
    }
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return res.status(400).json({ error: "amount_cents must be a positive integer" });
    }
    if (description.length > 200) {
      return res.status(400).json({ error: "description too long" });
    }

    const member = await db.get(
      `SELECT 1
       FROM group_members
       WHERE group_id = ? AND user_id = ?`,
      [groupId, payerId]
    );
    if (!member) {
      return res.status(400).json({ error: "payer must be a member of the group" });
    }

    const result = await db.run(
      `INSERT INTO expenses (group_id, payer_id, amount_cents, description)
      VALUES(?, ?, ?, ?)`,
      [groupId, payerId, amountCents, description.trim()]
    );

    res.status(201).json({ id: result.lastID });
  });

  // Update expense (correction only)
  router.put("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const { group_id, payer_id, amount_cents, description = "" } = req.body ?? {};
    const groupId = Number(group_id);
    const payerId = Number(payer_id);
    const amountCents = Number(amount_cents);

    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Invalid id" });
    if (!Number.isInteger(groupId))
      return res.status(400).json({ error: "group_id is required" });
    if (!Number.isInteger(payerId))
      return res.status(400).json({ error: "payer_id is required" });
    if (!Number.isInteger(amountCents) || amountCents <= 0)
      return res.status(400).json({ error: "amount_cents must be a positive integer" });
    if (description.length > 200)
      return res.status(400).json({ error: "description too long" });

    const member = await db.get(
      `SELECT 1
       FROM group_members
       WHERE group_id = ? AND user_id = ?`,
      [groupId, payerId]
    );
    if (!member) {
      return res.status(400).json({ error: "payer must be a member of the group" });
    }

    const result = await db.run(
      `UPDATE expenses
       SET payer_id = ?, amount_cents = ?, description = ?
       WHERE id = ? AND group_id = ?`,
      payerId,
      amountCents,
      description.trim(),
      id,
      groupId
    );

    if (result.changes === 0)
      return res.status(404).json({ error: "Expense not found" });

    res.json({ ok: true });
  });

  // Delete expense
  router.delete("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const groupId = Number(req.query.group_id);
    if (!Number.isInteger(id))
      return res.status(400).json({ error: "Invalid id" });
    if (!Number.isInteger(groupId))
      return res.status(400).json({ error: "group_id is required" });

    const result = await db.run(
      `DELETE FROM expenses WHERE id = ? AND group_id = ?`,
      id,
      groupId
    );

    if (result.changes === 0)
      return res.status(404).json({ error: "Expense not found" });

    res.json({ ok: true });
  });

  return router;
}
