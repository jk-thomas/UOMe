import express from "express";
import { computeSettlement } from "../services/settlement.js";

export function settlementRouter(db) {
  const router = express.Router();

  router.get("/", async (req, res) => {
    const groupId = Number(req.query.group_id);
    if (!Number.isInteger(groupId)) {
      return res.status(400).json({ error: "group_id is required" });
    }

    const members = await db.all(
      `SELECT u.id, u.name
       FROM group_members gm
       JOIN users u ON u.id = gm.user_id
       WHERE gm.group_id = ?
       ORDER BY u.id ASC`,
      [groupId]
    );

    const expenses = await db.all(
      `SELECT payer_id, amount_cents
       FROM expenses
       WHERE group_id = ?`,
      [groupId]
    );

    const result = computeSettlement(expenses, members);
    const nameById = Object.fromEntries(members.map((member) => [member.id, member.name]));

    const balances = {};
    for (const member of members) {
      balances[member.name] = result.balances[member.id] ?? 0;
    }

    const transfers = result.transfers.map((transfer) => ({
      from: nameById[transfer.from_user_id],
      to: nameById[transfer.to_user_id],
      amount_cents: transfer.amount_cents
    }));

    res.json({ members: members.map((member) => member.name), balances, transfers });
  });

  return router;
}
