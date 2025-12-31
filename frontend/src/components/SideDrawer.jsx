
export default function SideDrawer({ 
    open, 
    onClose, 
    activeView,
    setActiveView,
    balances, 
    transfers, 
    user, 
}) {
  if (!open) return null;

  //const myExpenses = expenses.filter(e => e.payer === user);
  const owedToMe = transfers.filter(t => t.to === user);
  const iOwe = transfers.filter(t => t.from === user);

  return (
    <div className="drawer">
        <button onClick={onClose}>Close</button>

      <nav className="drawer-menu">
        <button onClick={() => setActiveView("ledger")}>
          Ledger
        </button>

        <button onClick={() => setActiveView("owed")}>
          Owed to Me ({owedToMe.length})
        </button>

        <button onClick={() => setActiveView("owe")}>
          I Owe ({iOwe.length})
        </button>

        <button onClick={() => setActiveView("mine")}>
          My Transactions
        </button>
      </nav>

      <hr />

      <h4>Your Balance</h4>
      <p>${((balances[user] ?? 0) / 100).toFixed(2)}</p>
      {/* <button onClick={onClose}>Close</button>

      <h3>Your Balance</h3>
      <p>${(balances[user] / 100).toFixed(2)}</p>

      <h4>Settle Up</h4>
      {transfers
        .filter(t => t.from === user || t.to === user)
        .map((t, i) => (
          <div key={i}>
            {t.from} → {t.to}: ${(t.amount_cents / 100).toFixed(2)}
          </div>
        ))}

      <h4>Your Transactions</h4>
      {myExpenses.map(e => (
        <div key={e.id}>
          ${ (e.amount_cents / 100).toFixed(2) } – {e.description}
        </div>
      ))} */}
    </div>
  );
}
