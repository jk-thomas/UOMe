import { useState } from "react";

export default function AddExpenseModal({
  members,
  onSubmit,
  onClose,
  defaultPayerId,
}) {
  const [payerId, setPayerId] = useState(defaultPayerId);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleBackdropClick(e) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const parsed = Number(amount);
    if (!amount || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid amount greater than zero.");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        payer_id: Number(payerId),
        amount: parsed,
        description,
      });
      onClose();
    } catch (err) {
      setError(err.message || "Failed to add expense.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <form className="modal" onSubmit={handleSubmit}>
        <h3>Add Expense</h3>

        <label className="field-label">
          Paid by
          <select
            value={payerId}
            onChange={(e) => setPayerId(Number(e.target.value))}
          >
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>

        <label className="field-label">
          Amount
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <label className="field-label">
          Description
          <input
            placeholder="Optional"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        {error && <p className="error-msg">{error}</p>}

        <div className="modal-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "Adding…" : "Add"}
          </button>
          <button type="button" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
