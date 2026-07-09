import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { isValidUsername } from '../utils/validators'
import { GraduationCap, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CreateProfile() {
  const { user, setProfile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [checkingUsername, setCheckingUsername] = useState(false)
  const [usernameAvailable, setUsernameAvailable] = useState(null)
  const [form, setForm] = useState({
    fullName: user?.displayName || '',
    username: '',
    email: user?.email || '',
    country: '',
    college: '',
    department: '',
    semester: '',
    linkedin: '',
    github: '',
    portfolio: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (name === 'username') {
      setUsernameAvailable(null)
    }
  }

  const checkUsername = async () => {
    if (!isValidUsername(form.username)) {
      toast.error('Username must be 3-20 alphanumeric characters')
      return
    }
    setCheckingUsername(true)
    try {
      const snap = await getDoc(doc(db, 'profileNames', form.username))
      setUsernameAvailable(!snap.exists())
      if (!snap.exists()) {
        toast.success('Username available!')
      } else {
        toast.error('Username already taken')
      }
    } catch {
      toast.error('Failed to check username')
    } finally {
      setCheckingUsername(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.fullName || !form.username || !form.country || !form.college || !form.department || !form.semester) {
      toast.error('Please fill all required fields')
      return
    }
    if (!isValidUsername(form.username)) {
      toast.error('Username must be 3-20 alphanumeric characters')
      return
    }
    if (usernameAvailable !== true) {
      toast.error('Please check username availability first')
      return
    }

    setLoading(true)
    try {
      const userData = {
        ...form,
        xp: 0,
        level: 1,
        streak: 0,
        lastCheckin: null,
        plan: 'free',
        theme: 'glass',
        achievements: ['first_login'],
        photoURL: user?.photoURL || '',
        createdAt: new Date().toISOString()
      }
      await setDoc(doc(db, 'users', user.uid), userData)
      await setDoc(doc(db, 'profileNames', form.username), { uid: user.uid })
      setProfile(userData)
      toast.success('Profile created! Welcome to Student OS.')
      navigate('/dashboard', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Failed to create profile')
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    navigate('/login', { replace: true })
    return null
  }

  const inputClass = 'w-full rounded-xl px-4 py-2.5 text-sm bg-[var(--input-bg)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-all duration-200'

  return (
    <div className="w-full max-w-2xl py-8">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-3">
          <GraduationCap size={28} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold gradient-text mb-1">Complete Your Profile</h1>
        <p className="text-sm text-secondary">Set up your student identity</p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-secondary">Full Name *</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} className={inputClass} placeholder="John Doe" />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-secondary">Username *</label>
            <div className="flex gap-2">
              <input name="username" value={form.username} onChange={handleChange} className={`${inputClass} flex-1`} placeholder="johndoe_2024" />
              <button type="button" onClick={checkUsername} disabled={checkingUsername || !form.username} className="px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-0 flex items-center gap-2">
                {checkingUsername ? <Loader2 size={16} className="animate-spin" /> : null}
                Check
              </button>
            </div>
            {usernameAvailable === true && <p className="text-xs text-[var(--success)]">Username available!</p>}
            {usernameAvailable === false && <p className="text-xs text-[var(--danger)]">Username taken</p>}
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-sm font-medium text-secondary">Email *</label>
            <input name="email" type="email" value={form.email} className={`${inputClass} opacity-70`} disabled />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary">Country *</label>
            <input name="country" value={form.country} onChange={handleChange} className={inputClass} placeholder="India" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary">College/University *</label>
            <input name="college" value={form.college} onChange={handleChange} className={inputClass} placeholder="MIT" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary">Department/Stream *</label>
            <input name="department" value={form.department} onChange={handleChange} className={inputClass} placeholder="Computer Science" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary">Semester/Year *</label>
            <input name="semester" value={form.semester} onChange={handleChange} className={inputClass} placeholder="3rd Semester" />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary">LinkedIn (optional)</label>
            <input name="linkedin" value={form.linkedin} onChange={handleChange} className={inputClass} placeholder="https://linkedin.com/in/..." />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary">GitHub (optional)</label>
            <input name="github" value={form.github} onChange={handleChange} className={inputClass} placeholder="https://github.com/..." />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-secondary">Portfolio (optional)</label>
            <input name="portfolio" value={form.portfolio} onChange={handleChange} className={inputClass} placeholder="https://..." />
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full gradient-bg text-white py-3 rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer border-0 flex items-center justify-center gap-2">
          {loading && <Loader2 size={18} className="animate-spin" />}
          {loading ? 'Creating Profile...' : 'Start Your Journey'}
        </button>
      </form>
    </div>
  )
}
