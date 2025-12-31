import { useMemo, useState } from "react";
import { computePerExpenseOwes } from "../utils/settlement";

export default function SideDrawer({ 
    open, 
    onClose, 
    activeView,
    setActiveView,
    balances = {}, 
    transfers = [], 
    user, 
    expenses = [],
    members = []
}) {
  if (!open) return null;

  const myBalanceCents = balances[user] ?? 0;

  // Optimized transfers (net settlement)
  const paymentsToMe = transfers.filter(t => t.to === user);
  const paymentsIMake = transfers.filter(t => t.from === user);

  // Transparent per-expense obligations (gross)
  const perExpenseOwes = computePerExpenseOwes(expenses, members);
  const grossOwedToMe = perExpenseOwes.filter(o => o.to === user);
  const grossIOwe = perExpenseOwes.filter(o => o.from === user);

  function NavButton({ view, label, badge }) {
    const isActive = activeView === view;
    return (
      <button
        className={`drawer-nav-item ${isActive ? "active" : ""}`}
        onClick={() => {
          setActiveView(view);
          onClose();
        }}
      >
        <span>{label}</span>
        {typeof badge === "number" && (
          <span className="badge">{badge}</span>
        )}
      </button>
    );
  }

  return (
    <>
      {/* Overlay: click outside closes */}
      <div className="drawer-overlay" onClick={onClose} />

      <aside className="drawer" role="dialog" aria-modal="true">
        <div className="drawer-top">
          <button className="drawer-close" onClick={onClose}>✕</button>
          <div className="drawer-user">
            <div className="drawer-user-name">{user}</div>
            <div className="drawer-user-balance">
              Net Balance: ${(myBalanceCents / 100).toFixed(2)}
            </div>
          </div>
        </div>

        <nav className="drawer-nav">
          <NavButton view="ledger" label="Ledger" />
          <NavButton view="owed_simple" label="Owed to Me (Simple)" badge={grossOwedToMe.length} />
          <NavButton view="owe_simple" label="I Owe (Simple)" badge={grossIOwe.length} />
          <NavButton view="mine" label="My Transactions" />
          <NavButton view="owed_opt" label="Payments To You (Optimized)" badge={paymentsToMe.length} />
          <NavButton view="owe_opt" label="Payments You Make (Optimized)" badge={paymentsIMake.length} />
        </nav>

        <div className="drawer-footer-note">
          {/* <div className="note-title">Tip</div>
          <div className="note-text">
            “Simple” shows per-expense owes (easy to verify from the ledger).<br />
            “Optimized” reduces the number of payments using net settlement.
          </div> */}
        </div>
      </aside>
    </>
  );
}