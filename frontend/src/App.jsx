import { useEffect, useState } from "react";
import { getExpenses, getSettlement } from "./api";
import { useCurrentUser } from "./hooks/useCurrentUser";
import ExpenseList from "./components/ExpenseList";
import Balances from "./components/Balances";
import "./App.css";

export default function App() {
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState([]);
  const [balances, setBalances] = useState({});
  const [transfers, setTransfers] = useState([]);

  const { user, chooseUser } = useCurrentUser(members);

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

  if (!user) {
    return (
      <div className="container">
        <h2>Who are you?</h2>
        {members.map(m => (
          <button key={m} onClick={() => chooseUser(m)}>
            {m}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Shared Expenses</h1>
      <ExpenseList expenses={expenses} onRefresh={refresh} />
      <Balances
        balances={balances}
        transfers={transfers}
        currentUser={user}
      />
    </div>
  );
}
