
export function aggregateByPerson(owesList, key) {
  // key is either "from" (I owe) or "to" (owed to me)
  const totals = {};

  for (const o of owesList) {
    const person = o[key];
    totals[person] = (totals[person] || 0) + o.amount_cents;
  }

  return totals;
}
