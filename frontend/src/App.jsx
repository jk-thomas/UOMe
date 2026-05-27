import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import {
  getExpenses,
  getSettlement,
  addExpense,
  deleteExpense,
  listUsers,
} from "./api";

import { useCurrentUser } from "./hooks/useCurrentUser";
import { useCurrentGroup } from "./hooks/useCurrentGroup";

import UserSetup from "./components/UserSetup";
import GroupSetup from "./components/GroupSetup";
import JoinPage from "./components/JoinPage";
import Ledger from "./components/Ledger";
import FloatingAddButton from "./components/FloatingAddButton";
import AddExpenseModal from "./components/AddExpenseModal";
import SideDrawer from "./components/SideDrawer";
import Header from "./components/Header";
import ShareGroupInfo from "./components/ShareGroupInfo";
import { computePerExpenseOwes } from "./utils/settlement";
import { bilateralNetting } from "./utils/bitlateralNetting";

import "./App.css";

function normalizeExpenses(expenses) {
  return expenses.map((e) => ({ ...e, payer: e.payer_name }));
}

function MainApp() {
  const { userId, userName, setUser } = useCurrentUser();
  const { groupId, groupName, joinCode, setGroup } = useCurrentGroup();

  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [payerMembers, setPayerMembers] = useState([]);
  const [balances, setBalances] = useState({});
  const [transfers, setTransfers] = useState([]);

  const [activeView, setActiveView] = useState("ledger");
  const [showModal, setShowModal] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const normalizedExpenses = normalizeExpenses(expenses);

  async function refresh() {
    if (!groupId) return;

    const [expData, setData, allUsers] = await Promise.all([
      getExpenses(groupId),
      getSettlement(groupId),
      listUsers(),
    ]);

    setExpenses(expData.expenses);
    setMembers(setData.members);
    setBalances(setData.balances);
    setTransfers(setData.transfers);
    setPayerMembers(
      allUsers.filter((u) => setData.members.includes(u.name))
    );
  }

  useEffect(() => {
    if (groupId) {
      refresh();
    }
  }, [groupId]);

  async function handleAdd(data) {
    await addExpense({
      group_id: groupId,
      payer_id: data.payer_id,
      amount_cents: Math.round(data.amount * 100),
      description: data.description || "",
    });
    await refresh();
  }

  async function handleDelete(id) {
    await deleteExpense(id, groupId);
    await refresh();
  }

  function renderMainView() {
    if (activeView === "ledger") {
      return (
        <Ledger
          expenses={expenses}
          currentUserId={userId}
          onDelete={handleDelete}
        />
      );
    }

    const perExpenseOwes = computePerExpenseOwes(normalizedExpenses, members);

    if (activeView === "owed_simple") {
      const { owedToMe } = bilateralNetting(perExpenseOwes, userName);
      const names = Object.keys(owedToMe);
      if (names.length === 0) {
        return (
          <div className="empty">
            <p>No one owes you right now.</p>
            <p className="empty-hint">Per-expense breakdown from the ledger.</p>
          </div>
        );
      }

      return names.map((name) => (
        <div key={name} className="card">
          <strong>{name}</strong> owes you ${(owedToMe[name] / 100).toFixed(2)}
        </div>
      ));
    }

    if (activeView === "owe_simple") {
      const { iOwe } = bilateralNetting(perExpenseOwes, userName);
      const names = Object.keys(iOwe);
      if (names.length === 0) {
        return (
          <div className="empty">
            <p>You don't owe anyone right now.</p>
            <p className="empty-hint">Per-expense breakdown from the ledger.</p>
          </div>
        );
      }

      return names.map((name) => (
        <div key={name} className="card">
          You owe <strong>{name}</strong> ${(iOwe[name] / 100).toFixed(2)}
        </div>
      ));
    }

    if (activeView === "owed_opt") {
      const list = transfers.filter((t) => t.to === userName);
      if (list.length === 0) {
        return (
          <div className="empty">
            <p>No net payments to you.</p>
            <p className="empty-hint">Optimized settlement — fewer transfers overall.</p>
          </div>
        );
      }

      return list.map((t, i) => (
        <div key={i} className="card">
          <strong>{t.from}</strong> → You: ${(t.amount_cents / 100).toFixed(2)}
        </div>
      ));
    }

    if (activeView === "owe_opt") {
      const list = transfers.filter((t) => t.from === userName);
      if (list.length === 0) {
        return (
          <div className="empty">
            <p>No net payments for you to make.</p>
            <p className="empty-hint">Optimized settlement — fewer transfers overall.</p>
          </div>
        );
      }

      return list.map((t, i) => (
        <div key={i} className="card">
          You → <strong>{t.to}</strong>: ${(t.amount_cents / 100).toFixed(2)}
        </div>
      ));
    }

    if (activeView === "mine") {
      const mine = expenses.filter((e) => e.payer_id === userId);
      if (mine.length === 0) {
        return (
          <div className="empty">
            <p>You haven't paid for any expenses yet.</p>
            <p className="empty-hint">Expenses you add will appear here.</p>
          </div>
        );
      }

      return mine.map((e) => (
        <div key={e.id} className="card">
          ${(e.amount_cents / 100).toFixed(2)} – {e.description || "No description"}
        </div>
      ));
    }

    return null;
  }

  if (!userId) {
    return <UserSetup onComplete={(id, name) => setUser(id, name)} />;
  }

  if (!groupId) {
    return (
      <GroupSetup
        userId={userId}
        onGroupReady={(id, name, code) => setGroup(id, name, code)}
      />
    );
  }

  return (
    <div className="container">
      <Header
        title={groupName || "Expenses"}
        memberCount={members.length}
        onMenuClick={() => setDrawerOpen(true)}
      />

      <main className="main-content" key={activeView}>
        {renderMainView()}
      </main>

      {activeView === "ledger" && (
        <FloatingAddButton onClick={() => setShowModal(true)} />
      )}

      {showModal && (
        <AddExpenseModal
          members={payerMembers}
          defaultPayerId={userId}
          onSubmit={handleAdd}
          onClose={() => setShowModal(false)}
        />
      )}

      {showShare && joinCode && (
        <ShareGroupInfo
          groupName={groupName}
          joinCode={joinCode}
          onClose={() => setShowShare(false)}
        />
      )}

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        activeView={activeView}
        setActiveView={(view) => {
          setActiveView(view);
          setDrawerOpen(false);
        }}
        balances={balances}
        transfers={transfers}
        user={userName}
        expenses={normalizedExpenses}
        members={members}
        onShareGroup={
          joinCode
            ? () => {
                setDrawerOpen(false);
                setShowShare(true);
              }
            : undefined
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/join/:token" element={<JoinPage />} />
      <Route path="/*" element={<MainApp />} />
    </Routes>
  );
}
