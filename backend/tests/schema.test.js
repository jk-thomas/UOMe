const tables = await db.all (
    "SELECT name FROM sqlite_master WHERE type='table"
);

console.log(tables);