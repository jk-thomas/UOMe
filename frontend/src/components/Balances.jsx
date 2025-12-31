export default function Balances({ balances, transfers, currentUser }) {
  return (
    <>
      <h2>Balances</h2>

      <ul>
        {Object.entries(balances).map(([name, cents]) => (
          <li key={name} style={{ fontWeight: name === currentUser ? "bold" : "normal" }}>
            {name}: ${(cents / 100).toFixed(2)}
          </li>
        ))}
      </ul>

      <h3>Settle up</h3>
      <ul>
        {transfers.map((t, i) => (
          <li key={i}>
            {t.from} → {t.to}: ${(t.amount_cents / 100).toFixed(2)}
          </li>
        ))}
      </ul>
    </>
  );
}
