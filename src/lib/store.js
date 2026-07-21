import { localISO } from './utils'

const KEY = 'finance-tracker:transactions'

export const CATEGORIES = {
  expense: [
    'Food',
    'Transport',
    'Housing',
    'Utilities',
    'Health',
    'Education',
    'Entertainment',
    'Other',
  ],
  income: ['Salary', 'Business', 'Freelance', 'Gift', 'Other'],
}

function daysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return localISO(d)
}

function sampleData() {
  const rows = []
  let id = 1
  const add = (ago, type, category, description, amount) =>
    rows.push({ id: `s${id++}`, date: daysAgo(ago), type, category, description, amount })

  for (let m = 0; m < 4; m++) {
    const base = m * 30
    add(base + 1, 'income', 'Salary', 'Monthly salary', 350000)
    if (m % 2 === 0) add(base + 9, 'income', 'Freelance', 'Design gig', 60000 + m * 5000)
    add(base + 2, 'expense', 'Housing', 'Rent', 75000)
    add(base + 3, 'expense', 'Utilities', 'Electricity & water', 18500)
    add(base + 4, 'expense', 'Food', 'Market run', 22000)
    add(base + 8, 'expense', 'Food', 'Groceries', 15500)
    add(base + 15, 'expense', 'Food', 'Restaurant', 9000)
    add(base + 6, 'expense', 'Transport', 'Fuel', 14000)
    add(base + 18, 'expense', 'Transport', 'Taxi', 4500)
    add(base + 12, 'expense', 'Health', 'Pharmacy', 6500)
    add(base + 20, 'expense', 'Entertainment', 'Streaming & outings', 8000)
    if (m === 1) add(base + 22, 'expense', 'Education', 'Books', 12000)
  }
  return rows.sort((a, b) => b.date.localeCompare(a.date))
}

export function loadTransactions() {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    // corrupted storage — fall through to reseed
  }
  const seed = sampleData()
  localStorage.setItem(KEY, JSON.stringify(seed))
  return seed
}

export function saveTransactions(rows) {
  localStorage.setItem(KEY, JSON.stringify(rows))
}
