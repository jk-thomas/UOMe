import { useState } from "react";

export default function TransactionCard({ expense, isOwner, onDelete, onEdit }) {
  const [showActions, setShowActions] = useState(false);

  function openActions() {
    if (!isOwner) return;
    setShowActions(true);

    // Haptic feedback (mobile)
    if (navigator.vibrate) navigator.vibrate(30);
  }

  function handleTouchStart() {
    if (!isOwner) return;
    pressTimer.current = setTimeout(openActions, 450); // long press threshold
  }

  function handleTouchEnd() {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  }

  function handleContextMenu(e) {
    e.preventDefault();
    openActions();
  }

  return (
    <div
      className="card"
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
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
