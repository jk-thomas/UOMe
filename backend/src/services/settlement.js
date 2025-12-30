import { MEMBERS } from "../config/members.js";

export function computeSettlement(expenses) {
  const balances = {};
  MEMBERS.forEach(m => (balances[m] = 0));

  for (const e of expenses) {
    if (!balances.hasOwnProperty(e.payer)) continue;

    const n = MEMBERS.length;
    const share = Math.floor(e.amount_cents / n);
    const remainder = e.amount_cents - share * n;

    // payer fronted the full amount
    balances[e.payer] += e.amount_cents;

    // everyone owes their share
    MEMBERS.forEach((member, idx) => {
      balances[member] -= share;
      if (idx < remainder) balances[member] -= 1;
    });
  }

  return {
    balances,
    transfers: minimizeTransfers(balances)
  };
}

function minimizeTransfers(balances) {
  const debtors = [];
  const creditors = [];

  for (const [name, cents] of Object.entries(balances)) {
    if (cents < 0) debtors.push({ name, cents: -cents });
    if (cents > 0) creditors.push({ name, cents });
  }

  const transfers = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const amount = Math.min(d.cents, c.cents);

    transfers.push({
      from: d.name,
      to: c.name,
      amount_cents: amount
    });

    d.cents -= amount;
    c.cents -= amount;

    if (d.cents === 0) i++;
    if (c.cents === 0) j++;
  }

  return transfers;
}
