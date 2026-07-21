import { useState } from 'react'
import { aiAvailable, parseTransaction } from '../lib/ai'
import { CATEGORIES } from '../lib/store'
import { formatMoney } from '../lib/utils'

// Natural-language transaction entry: "spent 5000 on lunch yesterday" ->
// parsed fields, shown for one-tap confirmation before saving.
export default function AiEntry({ onAdd }) {
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [draft, setDraft] = useState(null)
  const [error, setError] = useState('')

  if (!aiAvailable) return null

  const parse = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    setError('')
    setDraft(null)
    try {
      const result = await parseTransaction(text, CATEGORIES)
      setDraft(result)
    } catch (err) {
      setError(err.message || 'Could not understand that')
    } finally {
      setBusy(false)
    }
  }

  const confirm = () => {
    onAdd({
      id: crypto.randomUUID(),
      date: draft.date,
      type: draft.type,
      category: draft.category,
      description: draft.description,
      amount: Number(draft.amount),
    })
    setDraft(null)
    setText('')
  }

  return (
    <section className="card ai-card">
      <h2>
        <span className="ai-tag">AI</span> Quick add
      </h2>
      <form className="ai-entry" onSubmit={parse}>
        <input
          type="text"
          placeholder="e.g. spent 4500 on a taxi yesterday"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? 'Reading…' : 'Parse'}
        </button>
      </form>

      {error && <p className="ai-error">{error}</p>}

      {draft && (
        <div className="ai-draft">
          <div className="ai-draft-body">
            <span className={`dot ${draft.type}`} aria-hidden="true" />
            <strong>{draft.description}</strong>
            <span className="muted">
              {draft.category} · {draft.date}
            </span>
            <span className={`ai-amount ${draft.type}`}>
              {draft.type === 'expense' ? '−' : '+'}
              {formatMoney(Number(draft.amount))}
            </span>
          </div>
          <div className="ai-draft-actions">
            <button className="btn-primary" onClick={confirm}>
              Add
            </button>
            <button className="btn-quiet" onClick={() => setDraft(null)}>
              Discard
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
