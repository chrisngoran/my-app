import { useMemo, useState } from 'react'
import { localISO } from './lib/utils'
import { useTransactions } from './lib/useTransactions'
import { useAuth } from './lib/auth.jsx'
import { aiAvailable } from './lib/ai'
import StatTiles from './components/StatTiles'
import TrendChart from './components/TrendChart'
import CategoryChart from './components/CategoryChart'
import TransactionForm from './components/TransactionForm'
import TransactionList from './components/TransactionList'
import AuthControl from './components/AuthControl'
import AiEntry from './components/AiEntry'
import Insights from './components/Insights'
import LoginScreen from './components/LoginScreen'

const RANGES = [
  { id: 'month', label: 'This month' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
  { id: 'all', label: 'All time' },
]

function rangeBounds(id) {
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  if (id === 'month') start.setDate(1)
  else if (id === '30d') start.setDate(start.getDate() - 29)
  else if (id === '90d') start.setDate(start.getDate() - 89)
  else return { start: null, prevStart: null }

  const days = Math.round((Date.now() - start) / 864e5) + 1
  const prevStart = new Date(start)
  if (id === 'month') prevStart.setMonth(prevStart.getMonth() - 1)
  else prevStart.setDate(prevStart.getDate() - days)
  return { start, prevStart }
}

// Auth gate. In cloud mode, an anonymous visitor sees the login screen — never
// the dashboard. In local-only mode (no Supabase) there are no accounts, so the
// dashboard renders directly.
export default function App() {
  const { user, loading, configured } = useAuth()
  const [guest, setGuest] = useState(false)

  if (configured && loading) {
    return (
      <div className="login-screen">
        <p className="muted">Loading…</p>
      </div>
    )
  }

  if (configured && !user && !guest) {
    return <LoginScreen onGuest={() => setGuest(true)} />
  }

  const isGuest = configured && !user && guest
  return <Dashboard isGuest={isGuest} onExitGuest={() => setGuest(false)} />
}

function Dashboard({ isGuest, onExitGuest }) {
  const { transactions, loading, addTransaction, deleteTransaction, clearAll } =
    useTransactions()
  const [range, setRange] = useState('month')

  // AI requires a signed-in user — never a local/guest session (protects the
  // Claude proxy from anonymous use and keeps the "AI off in local mode" promise).
  const aiEnabled = aiAvailable && !isGuest

  const { start, prevStart } = useMemo(() => rangeBounds(range), [range])

  const { filtered, previous } = useMemo(() => {
    if (!start) return { filtered: transactions, previous: null }
    const from = localISO(start)
    const prevFrom = localISO(prevStart)
    const filtered = transactions.filter((t) => t.date >= from)
    const previous = transactions
      .filter((t) => t.date >= prevFrom && t.date < from)
      .reduce((acc, t) => ({ ...acc, [t.type]: acc[t.type] + t.amount }), {
        income: 0,
        expense: 0,
      })
    return { filtered, previous }
  }, [transactions, start, prevStart])

  const totals = useMemo(
    () =>
      filtered.reduce(
        (acc, t) => ({ ...acc, [t.type]: acc[t.type] + t.amount }),
        { income: 0, expense: 0 },
      ),
    [filtered],
  )

  // Per-category expense totals for the AI budget/insights features.
  const categoryTotals = useMemo(() => {
    const map = {}
    for (const t of filtered) {
      if (t.type === 'expense') map[t.category] = (map[t.category] ?? 0) + t.amount
    }
    return map
  }, [filtered])

  const stats = useMemo(
    () => ({
      period: RANGES.find((r) => r.id === range)?.label,
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense,
      previous,
      byCategory: categoryTotals,
      currency: 'FCFA',
    }),
    [totals, previous, categoryTotals, range],
  )

  const handleClearAll = () => {
    if (window.confirm('Delete all transactions? This cannot be undone.')) {
      clearAll()
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <h1>Finance tracker</h1>
          <p className="sub">Income & spending at a glance</p>
        </div>
        {isGuest ? (
          <span className="auth-badge muted">
            Local mode
            <button className="btn-quiet" onClick={onExitGuest}>
              Sign in
            </button>
          </span>
        ) : (
          <AuthControl />
        )}
      </header>

      <div className="filter-row" role="group" aria-label="Date range">
        {RANGES.map((r) => (
          <button
            key={r.id}
            className={`filter-btn${range === r.id ? ' selected' : ''}`}
            aria-pressed={range === r.id}
            onClick={() => setRange(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {loading && <p className="muted loading-note">Loading your transactions…</p>}

      <StatTiles current={totals} previous={previous} />

      {aiEnabled && <AiEntry onAdd={addTransaction} />}

      <div className="charts">
        <section className="card">
          <h2>Cash flow</h2>
          <TrendChart transactions={filtered} rangeStart={start} />
        </section>
        <section className="card">
          <h2>Spending by category</h2>
          <CategoryChart transactions={filtered} />
        </section>
      </div>

      {aiEnabled && (
        <Insights
          stats={stats}
          transactions={filtered}
          categoryTotals={categoryTotals}
        />
      )}

      <section className="card">
        <h2>Add transaction</h2>
        <TransactionForm onAdd={addTransaction} aiEnabled={aiEnabled} />
      </section>

      <section className="card">
        <div className="list-head">
          <h2>Transactions</h2>
          <span className="muted count">{filtered.length} in range</span>
          {transactions.length > 0 && (
            <button className="btn-quiet" onClick={handleClearAll}>
              Clear all
            </button>
          )}
        </div>
        <TransactionList rows={filtered} onDelete={deleteTransaction} />
      </section>
    </div>
  )
}
