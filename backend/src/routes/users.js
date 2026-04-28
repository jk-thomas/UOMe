import express, { Router } from "express";

export function usersRouter(db) {
    const router = express.Router();

    router.get("/", async (_req, res) => {
        const users = await db.all(
            `SELECT id, name, created_at
             FROM users
             ORDER BY id ASC`
        );
        res.json({ users });
    });

    router.post("/", async (req, res) => {
        const { name } = req.body ?? {};
        if (typeof name !== "string" || name.trim().length === 0) {
            return res.status(400).json({ error: "name is required" });
        }
        
        const result = await db.run(
            `INSERT INTO users(name) VALUES(?)`,
            [name.trim()]
        );

        res.json({ id: result.lastID });
    });

    return router;
}
