import { formatMoney } from '../lib/utils'

export default function TransactionList({ rows, onDelete }) {
  if (!rows.length) return <p className="empty">No transactions in this range.</p>
  return (
    <div className="table-scroll">
      <table className="tx-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th className="cat">Category</th>
            <th className="num">Amount</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => (
            <tr key={t.id}>
              <td className="muted">{t.date}</td>
              <td>
                <span className={`dot ${t.type}`} aria-hidden="true" />
                {t.description}
                <span className="cat-inline muted">{t.category}</span>
              </td>
              <td className="muted cat">{t.category}</td>
              <td className="num">
                {t.type === 'expense' ? '−' : '+'}
                {formatMoney(t.amount)}
              </td>
              <td className="actions">
                <button
                  className="del"
                  onClick={() => onDelete(t.id)}
                  aria-label={`Delete ${t.description}`}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
