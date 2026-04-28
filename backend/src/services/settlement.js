export function computeSettlement(expenses, members) {
  const balances = {};
  for (const member of members) {
    balances[member.id] = 0;
  }

  if (members.length === 0) {
    return { balances, transfers: [] };
  }

  for (const expense of expenses) {
    if (!Object.prototype.hasOwnProperty.call(balances, expense.payer_id)) {
      continue;
    }

    const n = members.length;
    const share = Math.floor(expense.amount_cents / n);
    const remainder = expense.amount_cents - share * n;

    // Payer initially covers the full amount.
    balances[expense.payer_id] += expense.amount_cents;

    for (let idx = 0; idx < members.length; idx += 1) {
      const memberId = members[idx].id;
      balances[memberId] -= share;
      if (idx < remainder) balances[memberId] -= 1;
    }
  }

  return {
    balances,
    transfers: minimizeTransfers(balances)
  };
}

function minimizeTransfers(balances) {
  const debtors = [];
  const creditors = [];

  for (const [userId, cents] of Object.entries(balances)) {
    const id = Number(userId);
    if (cents < 0) debtors.push({ user_id: id, cents: -cents });
    if (cents > 0) creditors.push({ user_id: id, cents });
  }

  const transfers = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];
    const amount = Math.min(d.cents, c.cents);

    transfers.push({
      from_user_id: d.user_id,
      to_user_id: c.user_id,
      amount_cents: amount
    });

    d.cents -= amount;
    c.cents -= amount;

    if (d.cents === 0) i++;
    if (c.cents === 0) j++;
  }

  return transfers;
}
