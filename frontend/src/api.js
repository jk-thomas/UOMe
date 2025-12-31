const API_BASE = //"http://192.168.1.106:3001/api"
   import.meta.env.VITE_API_BASE || "http://localhost:3001/api";

export async function getExpenses() {
  const res = await fetch(`${API_BASE}/expenses`);
  if (!res.ok) throw new Error("Failed to load expenses");
  return res.json();
}

export async function addExpense(data) {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) throw new Error("Failed to add expense");
  return res.json();
}

export async function deleteExpense(id) {
  const res = await fetch(`${API_BASE}/expenses/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete expense");
}

export async function getSettlement() {
  const res = await fetch(`${API_BASE}/settlement`);
  if (!res.ok) throw new Error("Failed to load settlement");
  return res.json();
}
