import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, GraduationCap, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import toast from 'react-hot-toast'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const { loginWithGoogle, loginWithEmail, signUpWithEmail } = useAuth()
  const navigate = useNavigate()

  const handleGoogleLogin = async () => {
    setLoading(true)
    try {
      const user = await loginWithGoogle()
      const docSnap = await getDoc(doc(db, 'users', user.uid))
      navigate(docSnap.exists() ? '/dashboard' : '/create-profile')
    } catch (err) {
      toast.error(err.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return toast.error('Enter email and password')
    if (password.length < 6) return toast.error('Password must be at least 6 characters')
    setLoading(true)
    try {
      if (isSignUp) {
        await signUpWithEmail(email, password)
      } else {
        await loginWithEmail(email, password)
      }
      navigate('/dashboard')
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use' ? 'Email already registered. Sign in instead.'
        : err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' ? 'Invalid email or password'
        : err.code === 'auth/weak-password' ? 'Password too weak. Use at least 6 characters.'
        : err.message || 'Authentication failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-theme-lg">
          <GraduationCap size={32} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold gradient-text mb-2">Student OS</h1>
        <p className="text-secondary text-sm">Your all-in-one student productivity platform</p>
      </div>

      <div className="card p-8 space-y-5">
        <div className="text-center space-y-2">
          <h2 className="text-xl font-semibold text-primary">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-sm text-secondary">{isSignUp ? 'Sign up to get started' : 'Sign in to continue your journey'}</p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email"
              required
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-primary placeholder:text-muted outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Password"
              required
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--input-bg)] text-sm text-primary placeholder:text-muted outline-none focus:border-[var(--accent)] transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary cursor-pointer border-0 bg-transparent p-0"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl gradient-bg text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer disabled:opacity-50 border-0"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="relative flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border-color)]" />
          <span className="text-xs text-muted">or</span>
          <div className="flex-1 h-px bg-[var(--border-color)]" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-6 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-primary text-sm font-medium hover:bg-hover transition-all cursor-pointer disabled:opacity-50"
        >
          <svg viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          Continue with Google
        </button>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs text-[var(--accent)] hover:underline bg-transparent border-0 cursor-pointer"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-muted">Track attendance • Manage internals • AI study assistant • Notes sharing</p>
      </div>
    </div>
  )
}
