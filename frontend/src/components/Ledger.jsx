import TransactionCard from "./TransactionCard";

export default function Ledger({ expenses, currentUserId, onDelete, onEdit }) {
  return (
    <div className="ledger">
      {expenses.length === 0 && (
        <div className="empty">
          <p>No transactions yet.</p>
          <p className="empty-hint">Tap the + button to add your first expense.</p>
        </div>
      )}

      {expenses.map((e) => (
        <TransactionCard
          key={e.id}
          expense={e}
          isOwner={e.payer_id === currentUserId}
          onDelete={() => onDelete(e.id)}
          onEdit={() => onEdit?.(e)}
        />
      ))}
    </div>
  );
}
