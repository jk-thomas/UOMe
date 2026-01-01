// utils/bilateralNetting.js

/**
 * Computes pairwise net obligations between `user` and others.
 *
 * Input: list of per-expense owes
 * Output:
 *   {
 *     owedToMe: { Joel: 1500 },
 *     iOwe:     { Mark: 2500 }
 *   }
 */
export function bilateralNetting(owesList, user) {
  const owedToMe = {};
  const iOwe = {};

  for (const o of owesList) {
    if (o.from === user) {
      // I owe someone
      iOwe[o.to] = (iOwe[o.to] || 0) + o.amount_cents;
    } else if (o.to === user) {
      // Someone owes me
      owedToMe[o.from] = (owedToMe[o.from] || 0) + o.amount_cents;
    }
  }

  // Net pairwise
  for (const person of Object.keys({ ...owedToMe, ...iOwe })) {
    const theyOwe = owedToMe[person] || 0;
    const iOweThem = iOwe[person] || 0;

    if (theyOwe === iOweThem) {
      delete owedToMe[person];
      delete iOwe[person];
    } else if (theyOwe > iOweThem) {
      owedToMe[person] = theyOwe - iOweThem;
      delete iOwe[person];
    } else {
      iOwe[person] = iOweThem - theyOwe;
      delete owedToMe[person];
    }
  }

  return { owedToMe, iOwe };
}
