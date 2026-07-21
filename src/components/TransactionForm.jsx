import { useState } from 'react'
import { CATEGORIES } from '../lib/store'
import { localISO } from '../lib/utils'
import { suggestCategory } from '../lib/ai'

export default function TransactionForm({ onAdd, aiEnabled = false }) {
  const [type, setType] = useState('expense')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(CATEGORIES.expense[0])
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(localISO(new Date()))
  const [suggesting, setSuggesting] = useState(false)

  const changeType = (t) => {
    setType(t)
    setCategory(CATEGORIES[t][0])
  }

  const autoCategorize = async () => {
    if (!description.trim()) return
    setSuggesting(true)
    try {
      const { category: guess } = await suggestCategory(
        description,
        type,
        CATEGORIES[type],
      )
      if (CATEGORIES[type].includes(guess)) setCategory(guess)
    } catch {
      // Non-fatal — user can still pick a category manually.
    } finally {
      setSuggesting(false)
    }
  }

  const submit = (e) => {
    e.preventDefault()
    const value = Number(amount)
    if (!value || value <= 0) return
    onAdd({
      id: crypto.randomUUID(),
      date,
      type,
      category,
      description: description.trim() || category,
      amount: value,
    })
    setAmount('')
    setDescription('')
  }

  return (
    <form className="tx-form" onSubmit={submit}>
      <label>
        Type
        <select value={type} onChange={(e) => changeType(e.target.value)}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </label>
      <label>
        Amount (FCFA)
        <input
          type="number"
          min="1"
          step="1"
          required
          placeholder="0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </label>
      <label>
        <span className="label-row">
          Category
          {aiEnabled && (
            <button
              type="button"
              className="btn-link"
              onClick={autoCategorize}
              disabled={suggesting || !description.trim()}
            >
              {suggesting ? 'Suggesting…' : 'AI suggest'}
            </button>
          )}
        </span>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES[type].map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </label>
      <label className="grow">
        Description
        <input
          type="text"
          placeholder="Optional"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label>
        Date
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </label>
      <button type="submit" className="btn-primary">
        Add
      </button>
    </form>
  )
}
