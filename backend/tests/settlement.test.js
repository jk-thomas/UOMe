import { assert, request } from "./helpers.js";

console.log("▶ settlement tests");

const res = await request("/api/settlement");
assert(res.status === 200, "settlement endpoint works");

const { balances, transfers } = res.body;

assert(balances.Joshua !== undefined, "balances include Joshua");
assert(Array.isArray(transfers), "transfers is array");

console.log("Balances:", balances);
console.log("Transfers:", transfers);

console.log("✅ settlement tests passed");
process.exit(0);
