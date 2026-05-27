const API_BASE =
  import.meta.env.VITE_API_BASE ?? "http://localhost:3001/api";

async function parseError(res, fallback) {
  try {
    const data = await res.json();
    if (data?.error) return data.error;
  } catch {
    // ignore non-JSON body
  }
  return fallback;
}

export async function createUser(name) {
  const res = await fetch(`${API_BASE}/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to create user"));
  return res.json();
}

export async function listUsers() {
  const res = await fetch(`${API_BASE}/users`);
  if (!res.ok) throw new Error(await parseError(res, "Failed to load users"));
  const data = await res.json();
  return data.users;
}

export async function createGroup(name, userId) {
  const res = await fetch(`${API_BASE}/groups`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, user_id: userId }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to create group"));
  return res.json();
}

export async function joinGroup(token, userId) {
  const res = await fetch(`${API_BASE}/groups/join/${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to join group"));
  return res.json();
}

export async function getExpenses(groupId) {
  const res = await fetch(`${API_BASE}/expenses?group_id=${groupId}`);
  if (!res.ok) throw new Error(await parseError(res, "Failed to load expenses"));
  return res.json();
}

export async function addExpense({ group_id, payer_id, amount_cents, description }) {
  const res = await fetch(`${API_BASE}/expenses`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ group_id, payer_id, amount_cents, description }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to add expense"));
  return res.json();
}

export async function deleteExpense(id, groupId) {
  const res = await fetch(`${API_BASE}/expenses/${id}?group_id=${groupId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await parseError(res, "Failed to delete expense"));
}

export async function getSettlement(groupId) {
  const res = await fetch(`${API_BASE}/settlement?group_id=${groupId}`);
  if (!res.ok) throw new Error(await parseError(res, "Failed to load settlement"));
  return res.json();
}
