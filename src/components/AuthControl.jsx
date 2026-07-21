import { useState } from 'react'
import { useAuth } from '../lib/auth.jsx'

export default function AuthControl() {
  const { user, configured, signIn, signUp, signOut } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')

  // Local-only mode: no accounts, nothing to show.
  if (!configured) {
    return <span className="auth-badge muted">Local mode · data stays on this device</span>
  }

  if (user) {
    return (
      <span className="auth-badge">
        {user.email}
        <button className="btn-quiet" onClick={signOut}>
          Sign out
        </button>
      </span>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setNote('')
    setBusy(true)
    try {
      if (mode === 'signin') {
        await signIn(email, password)
      } else {
        const data = await signUp(email, password)
        // Only prompt for email confirmation when one is actually required
        // (no session came back). Otherwise the auth listener signs them in.
        if (!data?.session) {
          setNote('Check your email to confirm your account, then sign in.')
        }
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
      />
      <button type="submit" className="btn-primary" disabled={busy}>
        {mode === 'signin' ? 'Sign in' : 'Sign up'}
      </button>
      <button
        type="button"
        className="btn-link"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Create account' : 'Have an account?'}
      </button>
      {error && <span className="auth-error">{error}</span>}
      {note && <span className="auth-note">{note}</span>}
    </form>
  )
}
