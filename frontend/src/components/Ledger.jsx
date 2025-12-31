import TransactionCard from "./TransactionCard";

export default function Ledger({ expenses, currentUser, onDelete, onEdit }) {
  return (
    <div className="ledger">
      {expenses.length === 0 && (
        <div className="empty">No transactions yet</div>
      )}

      {expenses.map(e => (
        <TransactionCard
          key={e.id}
          expense={e}
          isOwner={e.payer === currentUser}
          onDelete={() => onDelete(e.id)}
          onEdit={() => onEdit(e)}
        />
      ))}
    </div>
  );
}
