import AuthControl from './AuthControl'

// Shown when cloud mode is configured but no one is signed in. The dashboard
// stays gated behind authentication — unless the visitor chooses local-only.
export default function LoginScreen({ onGuest }) {
  return (
    <div className="login-screen">
      <div className="login-card">
        <h1>Finance tracker</h1>
        <p className="sub">Sign in to see your income, spending, and AI insights.</p>
        <AuthControl />
        <div className="login-divider">
          <span>or</span>
        </div>
        <button className="btn-secondary login-guest" onClick={onGuest}>
          Continue without an account
        </button>
        <p className="login-guest-note">
          Local-only mode — data stays on this device, and AI features stay off.
        </p>
      </div>
    </div>
  )
}
