import express from "express"
import { genToken } from "../utils/generateToken.js";

export function groupsRouter(db) {
    const router = express.Router();

    function validName(name) {
        return typeof name === "string" && name.trim().length > 0 && name.trim().length <= 100;
    }

    async function createUniqueToken() {
        for (let attempt = 0; attempt < 10; attempt += 1) {
            const token = genToken();
            const exists = await db.get(`SELECT 1 FROM groups WHERE join_token = ?`, [token]);
            if (!exists) return token;
        }
        return null;
    }

    // create a group
    router.post("/", async (req, res) => {
        const { name, user_id } = req.body ?? {};
        const userId = Number(user_id);
        if (!validName(name)) {
            return res.status(400).json({ error: "name is required" });
        }
        if (!Number.isInteger(userId)) {
            return res.status(400).json({ error: "user_id is required" });
        }

        const token = await createUniqueToken();
        if (!token) {
            return res.status(500).json({ error: "Could not generate join token" });
        }

        const result = await db.run(
            `INSERT INTO groups(name, join_token) VALUES(?, ?)`,
            [name.trim(), token]
        );

        const groupId = result.lastID;

        // add creator as member
        await db.run(
            `INSERT INTO group_members(group_id, user_id)
            VALUES (?, ?)`,
            [groupId, userId]
        );

        res.json({
            group_id: groupId,
            join_link: `/join/${token}`,
            join_code: token
        });
    });

    // join group
    router.post("/join/:token", async (req, res) => {
        const { token } = req.params;
        const userId = Number(req.body?.user_id);
        if (!Number.isInteger(userId)) {
            return res.status(400).json({ error: "user_id is required" });
        }

        const group = await db.get(
            `SELECT id FROM groups WHERE join_token = ?`,
            [token]
        );

        if (!group) {
            return res.status(404).json({ error: "Invalid token" });
        }

        await db.run(
            `INSERT OR IGNORE INTO group_members (group_id, user_id)
            VALUES(?, ?)`,
            [group.id, userId]
        );

        res.json({group_id: group.id});
    });

    return router;
}
