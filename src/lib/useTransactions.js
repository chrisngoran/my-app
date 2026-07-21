import { useCallback, useEffect, useState } from 'react'
import { supabase, supabaseConfigured } from './supabase'
import { useAuth } from './auth.jsx'
import { loadTransactions, saveTransactions } from './store'

const sortByDate = (rows) => [...rows].sort((a, b) => b.date.localeCompare(a.date))

// Supabase returns amount as a string (numeric type) — normalize to number.
const mapRow = (r) => ({
  id: r.id,
  date: r.date,
  type: r.type,
  category: r.category,
  description: r.description,
  amount: Number(r.amount),
})

// Single source of transactions for the app. Uses Supabase (per-user, cloud
// synced) when configured and signed in; otherwise localStorage. The calling
// component doesn't need to know which backend is active.
export function useTransactions() {
  const { user } = useAuth()
  const cloud = supabaseConfigured && !!user
  const [transactions, setTransactions] = useState(() =>
    cloud ? [] : loadTransactions(),
  )
  const [loading, setLoading] = useState(cloud)

  // Load rows for the active backend.
  useEffect(() => {
    if (!cloud) {
      setTransactions(loadTransactions())
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false })
      .then(({ data }) => {
        if (active) {
          setTransactions((data ?? []).map(mapRow))
          setLoading(false)
        }
      })
    return () => {
      active = false
    }
  }, [cloud, user?.id])

  // Persist local-mode changes back to localStorage.
  useEffect(() => {
    if (!cloud && !loading) saveTransactions(transactions)
  }, [transactions, cloud, loading])

  const addTransaction = useCallback(
    async (tx) => {
      if (cloud) {
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            date: tx.date,
            type: tx.type,
            category: tx.category,
            description: tx.description,
            amount: tx.amount,
          })
          .select()
          .single()
        if (error) throw error
        setTransactions((prev) => sortByDate([mapRow(data), ...prev]))
      } else {
        setTransactions((prev) => sortByDate([tx, ...prev]))
      }
    },
    [cloud, user],
  )

  const deleteTransaction = useCallback(
    async (id) => {
      if (cloud) {
        const { error } = await supabase.from('transactions').delete().eq('id', id)
        if (error) throw error
      }
      setTransactions((prev) => prev.filter((r) => r.id !== id))
    },
    [cloud],
  )

  const clearAll = useCallback(async () => {
    if (cloud) {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
      if (error) throw error
    }
    setTransactions([])
  }, [cloud, user])

  return { transactions, loading, addTransaction, deleteTransaction, clearAll }
}
