import express from "express"
import { genToken } from "../utils/generateToken.js";

export function groupsRouter(db) {
    const router = express.Router();

    // create a group
    router.post("/", async (req, res) => {
        const { name, user_id } = req.body;

        const token = genToken();

        const result = await db.run(
            `INSERT INTO groups(name, join_token) VALUES(?, ?)`,
            [name, token]
        );

        const groupId = result.lastID;

        // add creator as member
        await db.run(
            `INSERT INTO group_members(group_id, user_id)
            VALUES (?, ?)`,
            [groupId, user_id]
        );

        res.json({
            group_id: groupId,
            join_link: `/join/${token}`,
            join_code: {token}
        });
    });

    // join group
    router.post("/join/:token", async (req, res) => {
        const { token } = req.params;
        const { user_id } = req.body;

        const group = await db.get(
            `SELECT id FROM groups WHERE join_token = ?`,
            [token]
        );

        if (!group) {
            return res.status(404).json({ error: "Invalid link" });
        }

        await db.run(
            `INSERT OR IGNORE INTO group_members (group_id, user_id)
            VALUES(?, ?)`,
            [group.id, user_id]
        );

        res.json({group_id: group.id});
    });

    return router;
}
