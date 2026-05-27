import { useState, useEffect } from "react";
import { createUser, listUsers } from "../api";

export default function UserSetup({ onComplete }) {
  const [name, setName] = useState("");
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch(() => setError("Failed to load users"));
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;

    setLoading(true);
    setError("");
    try {
      const { id } = await createUser(trimmed);
      onComplete(id, trimmed);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSelect(user) {
    onComplete(user.id, user.name);
  }

  return (
    <div className="container setup-screen">
      <h2>Welcome to UOMe</h2>
      <p>Enter your name to get started, or select an existing profile.</p>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
        />
        <button type="submit" disabled={loading || !name.trim()}>
          {loading ? "Creating…" : "Create"}
        </button>
      </form>

      {error && <p className="error-msg">{error}</p>}

      {users.length > 0 ? (
        <div className="user-list">
          <h3>Existing users</h3>
          {users.map((user) => (
            <button
              key={user.id}
              type="button"
              className="user-btn"
              onClick={() => handleSelect(user)}
            >
              {user.name}
            </button>
          ))}
        </div>
      ) : (
        !error && (
          <div className="empty">
            No existing users yet — create your profile above to get started.
          </div>
        )
      )}
    </div>
  );
}
