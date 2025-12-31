import { useState } from "react";

export default function AddExpenseModal({ members, onSubmit, onClose, defaultPayer }) {
  const [payer, setPayer] = useState(defaultPayer);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    await onSubmit({ payer, amount: Number(amount), description });
    onClose();
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" onSubmit={handleSubmit}>
        <h3>Add Expense</h3>

        <select value={payer} onChange={e => setPayer(e.target.value)}>
          {members.map(m => (
            <option key={m}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          step="0.01"
          placeholder="Amount"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />

        <input
          placeholder="Description (optional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
        />

        <button type="submit">Add</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </form>
    </div>
  );
}
