import { useState } from "react";

export default function TransactionCard({ expense, isOwner, onDelete, onEdit }) {
  const [showActions, setShowActions] = useState(false);

  function handleContextMenu(e) {
    e.preventDefault();
    if (isOwner) setShowActions(true);
  }

  return (
    <div
      className="card"
      onContextMenu={handleContextMenu}
      onTouchStart={() => isOwner && setShowActions(true)}
    >
      <div className="card-main">
        <strong>{expense.payer}</strong> paid $
        {(expense.amount_cents / 100).toFixed(2)}
        <div className="desc">{expense.description}</div>
        <small>{new Date(expense.created_at).toLocaleString()}</small>
      </div>

      {showActions && (
        <div className="card-actions">
          <button onClick={onEdit}>Edit</button>
          <button onClick={onDelete}>Delete</button>
          <button onClick={() => setShowActions(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}
