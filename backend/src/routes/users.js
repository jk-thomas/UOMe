import express, { Router } from "express";

export function usersRouter(db) {
    const router = express.Router();

    router.post("/", async (req, res) => {
        const { name } = req.body;
        
        const result = await db.run(
            `INSERT INTO users(name) VALUES(?)`,
            [name]
        );

        res.json({ id: result.lastID });
    });

    return router;
}
