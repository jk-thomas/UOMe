import { assert, request } from "./helpers.js";

console.log("▶ expenses tests");

// add expense
const add = await request("/api/expenses", {
  method: "POST",
  body: JSON.stringify({
    payer: "Joshua",
    amount: 100,
    description: "Dinner"
  })
});
assert(add.status === 201, "should add expense");

// list expenses
const list = await request("/api/expenses");
assert(list.status === 200, "should list expenses");
assert(list.body.expenses.length > 0, "expenses should not be empty");

console.log("✅ expenses tests passed");
process.exit(0);
