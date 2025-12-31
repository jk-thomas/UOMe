import { deleteExpense } from "../api";

export default function ExpenseList({ expenses, onRefresh }) {
  async function handleDelete(id) {
    if (!confirm("Delete this expense?")) return;
    await deleteExpense(id);
    onRefresh();
  }

  return (
    <>
      <h2>Expenses</h2>
      {expenses.map(e => (
        <div key={e.id} className="card">
          <strong>{e.payer}</strong> paid ${(e.amount_cents / 100).toFixed(2)}
          <div>{e.description}</div>
          <small>{e.created_at}</small>
          <button onClick={() => handleDelete(e.id)}>Delete</button>
        </div>
      ))}
    </>
  );
}
