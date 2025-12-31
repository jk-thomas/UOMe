import { useEffect, useState } from "react";
import {
  getExpenses,
  getSettlement,
  addExpense,
  deleteExpense
} from "./api";

import { useCurrentUser } from "./hooks/useCurrentUser";

import Ledger from "./components/Ledger";
import FloatingAddButton from "./components/FloatingAddButton";
import AddExpenseModal from "./components/AddExpenseModal";
import SideDrawer from "./components/SideDrawer";
import Header from "./components/Header";
import { computePerExpenseOwes } from "./utils/settlement";

import "./App.css";

export default function App() {
  /* -------------------- STATE -------------------- */
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState({});
  const [transfers, setTransfers] = useState([]);
  
  const [activeView, setActiveView] = useState("ledger");
  const [showModal, setShowModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { user, chooseUser } = useCurrentUser(members);

  /* -------------------- DATA LOADING -------------------- */
  async function refresh() {
    const exp = await getExpenses();
    const set = await getSettlement();

    setExpenses(exp.expenses);
    setMembers(exp.members);
    setBalances(set.balances);
    setTransfers(set.transfers);
  }

  useEffect(() => {
    refresh();
  }, []);

  /* -------------------- HANDLERS -------------------- */
  async function handleAdd(data) {
    await addExpense(data);
    await refresh();
  }

  async function handleDelete(id) {
    await deleteExpense(id);
    await refresh();
  }

  /* -------------------- MAIN VIEW SWITCH -------------------- */
  function renderMainView() {
    if (activeView === "ledger") {
      return (
        <Ledger
          expenses={expenses}
          currentUser={user}
          onDelete={handleDelete}
        />
      );
    }

    // Simple (per-expense) transparent views
    const perExpenseOwes = computePerExpenseOwes(expenses, members);

    if (activeView === "owed_simple") {
      const list = perExpenseOwes.filter(o => o.to === user);
      if (list.length === 0) return <div className="empty">No one owes you (simple)</div>;

      return list.map((o, i) => (
        <div key={`${o.expenseId}-${o.from}-${i}`} className="card">
          <strong>{o.from}</strong> owes you ${(o.amount_cents / 100).toFixed(2)}
          {o.description ? <div className="desc">{o.description}</div> : null}
        </div>
      ));
    }

    if (activeView === "owe_simple") {
      const list = perExpenseOwes.filter(o => o.from === user);
      if (list.length === 0) return <div className="empty">You don’t owe anyone (simple)</div>;

      return list.map((o, i) => (
        <div key={`${o.expenseId}-${o.to}-${i}`} className="card">
          You owe <strong>{o.to}</strong> ${(o.amount_cents / 100).toFixed(2)}
          {o.description ? <div className="desc">{o.description}</div> : null}
        </div>
      ));
    }

    // net settlement views
    if (activeView === "owed_opt") {
      const list = transfers.filter(t => t.to === user);
      if (list.length === 0) return <div className="empty">No payments to you (optimized)</div>;

      return list.map((t, i) => (
        <div key={i} className="card">
          <strong>{t.from}</strong> → You: ${(t.amount_cents / 100).toFixed(2)}
        </div>
      ));
    }

    if (activeView === "owe_opt") {
      const list = transfers.filter(t => t.from === user);
      if (list.length === 0) return <div className="empty">No payments to make (optimized)</div>;

      return list.map((t, i) => (
        <div key={i} className="card">
          You → <strong>{t.to}</strong>: ${(t.amount_cents / 100).toFixed(2)}
        </div>
      ));
    }

    if (activeView === "mine") {
      const mine = expenses.filter(e => e.payer === user);
      if (mine.length === 0) return <div className="empty">No transactions yet</div>;

      return mine.map(e => (
        <div key={e.id} className="card">
          ${(e.amount_cents / 100).toFixed(2)} – {e.description || "No description"}
        </div>
      ));
    }

    return null;
  }

  /* -------------------- EARLY RETURN (IDENTITY) -------------------- */
  if (!user) {
    return (
      <div className="container">
        <h2>Select User</h2>
        {members.map(m => (
          <button key={m} onClick={() => chooseUser(m)}>
            {m}
          </button>
        ))}
      </div>
    );
  }

  /* -------------------- RENDER -------------------- */
  return (
    <div className="container">
      {/* Header */}
      <Header
        title="Share Expenses"
        onMenuClick={() => setDrawerOpen(true)}
      />

      {/* Main Content */}
      {renderMainView()}

      {/* Floating + button */}
      {activeView === "ledger" && (
        <FloatingAddButton onClick={() => setShowModal(true)} />
      )}

      {/* Add Expense Modal */}
      {showModal && (
        <AddExpenseModal
          members={members}
          defaultPayer={user}
          onSubmit={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}

      {/* Side Drawer (personal view) */}
      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        setActiveView={view => {
          setActiveView(view);
          setDrawerOpen(false);
        }}
        balances={balances}
        transfers={transfers}
        user={user}
        expenses={expenses}
        members={members}
      />
    </div>
  );
}

