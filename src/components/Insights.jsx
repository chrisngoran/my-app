import { useState } from 'react'
import { aiAvailable, budgetReview, generateInsights } from '../lib/ai'
import { formatMoney } from '../lib/utils'

// AI spending insights + budget/anomaly review for the current period.
export default function Insights({ stats, transactions, categoryTotals }) {
  const [insight, setInsight] = useState('')
  const [budget, setBudget] = useState(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  if (!aiAvailable) return null

  const run = async (kind) => {
    setBusy(kind)
    setError('')
    try {
      if (kind === 'insight') {
        const { text } = await generateInsights(stats)
        setInsight(text)
      } else {
        const result = await budgetReview(categoryTotals, transactions.slice(0, 60))
        setBudget(result)
      }
    } catch (err) {
      setError(err.message || 'AI request failed')
    } finally {
      setBusy('')
    }
  }

  const empty = !transactions.length

  return (
    <section className="card ai-card">
      <h2>
        <span className="ai-tag">AI</span> Insights & budget
      </h2>
      <div className="ai-actions">
        <button
          className="btn-secondary"
          onClick={() => run('insight')}
          disabled={busy || empty}
        >
          {busy === 'insight' ? 'Analyzing…' : 'Explain my spending'}
        </button>
        <button
          className="btn-secondary"
          onClick={() => run('budget')}
          disabled={busy || empty}
        >
          {busy === 'budget' ? 'Reviewing…' : 'Suggest budgets & flag anomalies'}
        </button>
      </div>

      {empty && <p className="muted">Add some transactions to unlock insights.</p>}
      {error && <p className="ai-error">{error}</p>}

      {insight && <p className="ai-insight">{insight}</p>}

      {budget && (
        <div className="ai-budget">
          {budget.anomalies?.length > 0 && (
            <div className="ai-anomalies">
              {budget.anomalies.map((a, i) => (
                <div key={i} className="ai-anomaly">
                  <span className="ai-flag" aria-hidden="true">
                    ⚠
                  </span>
                  <span>
                    <strong>{a.description}</strong> — {formatMoney(a.amount)}. {a.reason}
                  </span>
                </div>
              ))}
            </div>
          )}
          {budget.budgets?.length > 0 && (
            <table className="ai-budget-table">
              <thead>
                <tr>
                  <th>Category</th>
                  <th className="num">Suggested</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                {budget.budgets.map((b) => (
                  <tr key={b.category}>
                    <td>{b.category}</td>
                    <td className="num">{formatMoney(b.suggested)}</td>
                    <td className="muted">{b.rationale}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </section>
  )
}
