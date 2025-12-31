// Returns "gross obligations": for each expense, everyone except payer owes payer an equal share.

export function computePerExpenseOwes(expenses, members) {
  const owes = [];
  const n = members.length;

  for (const e of expenses) {
    if (!members.includes(e.payer)) continue;

    const share = Math.floor(e.amount_cents / n);
    const remainder = e.amount_cents - share * n;

    // match backend determinism for leftover cents (first 'remainder' members pay 1 cent extra)
    members.forEach((m, idx) => {
      if (m === e.payer) return;

      let amount = share;
      if (idx < remainder) amount += 1;

      owes.push({
        from: m,
        to: e.payer,
        amount_cents: amount,
        expenseId: e.id,
        description: e.description || "",
        created_at: e.created_at,
      });
    });
  }

  return owes;
}
