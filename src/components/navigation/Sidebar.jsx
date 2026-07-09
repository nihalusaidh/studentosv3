import { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, CalendarCheck, BarChart3, Calendar,
  Sparkles, BookOpen, User, Settings, Shield, X, ListChecks,
  ListTodo, Timer, GraduationCap, Crown, Sun, Moon, Download
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { usePremium } from '../../contexts/PremiumContext'
import { useSync } from '../../contexts/SyncContext'
import { themeList } from '../../themes/themeConfig'
import Avatar from '../ui/Avatar'

const LIGHT_THEMES = ['academic', 'minimal', 'sunrise', 'lavender', 'fresh']

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/habits', label: 'Habits', icon: ListChecks },
  { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/internals', label: 'Internals', icon: BarChart3 },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/tasks', label: 'Tasks', icon: ListTodo },
  { path: '/exams', label: 'Exams', icon: Timer },
  { path: '/ai', label: 'AI Workspace', icon: Sparkles },
  { path: '/notes', label: 'Notes Hub', icon: BookOpen },
  { path: '/grades', label: 'GPA Calculator', icon: GraduationCap },
  { path: '/premium', label: 'Premium', icon: Crown },
  { path: '/profile', label: 'Profile', icon: User },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ open, onClose }) {
  const { profile } = useAuth()
  const { isPremium } = usePremium()
  const { currentTheme, currentThemeId, changeTheme } = useTheme()
  const { syncStatus, pendingChanges, doSync } = useSync()
  const [installPrompt, setInstallPrompt] = useState(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return
    installPrompt.prompt()
    const result = await installPrompt.userChoice
    if (result.outcome === 'accepted') setShowInstall(false)
    setInstallPrompt(null)
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside className={`
        fixed top-0 left-0 h-full w-64 z-50
        bg-[var(--sidebar-bg)] border-r border-[var(--border-color)]
        transform transition-transform duration-300
        lg:translate-x-0 lg:static lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-lg gradient-text">Student OS</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 rounded-lg hover:bg-hover text-secondary cursor-pointer border-0 bg-transparent">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'gradient-bg text-white shadow-theme'
                  : 'text-secondary hover:text-primary hover:bg-hover'
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-1">
          <p className="text-[10px] text-muted font-medium px-1 mb-1.5">Theme</p>
          <div className="grid grid-cols-5 gap-1">
            {themeList.map(t => {
              const isLight = LIGHT_THEMES.includes(t.id)
              const accent = t.vars['--accent']
              const isActive = currentThemeId === t.id
              return (
                <button key={t.id} onClick={() => changeTheme(t.id)} title={t.name}
                  className={`flex items-center justify-center p-1.5 rounded-lg border transition-all cursor-pointer border-0 ${
                    isActive
                      ? 'ring-2 ring-offset-1 ring-offset-[var(--sidebar-bg)] scale-110'
                      : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{ backgroundColor: accent, boxShadow: isActive ? `0 0 0 1px ${accent}44` : 'none' }}>
                  <span className="text-[8px] font-bold"
                    style={{ color: isLight ? '#fff' : '#fff' }}>
                    {isLight ? <Sun size={10} /> : <Moon size={10} />}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
        <div className="px-3 pt-1 space-y-1">
          <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[var(--bg-secondary)]">
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-green-400' :
                syncStatus === 'syncing' || syncStatus === 'restoring' ? 'bg-amber-400 animate-pulse' :
                syncStatus === 'error' ? 'bg-red-400' :
                'bg-gray-400'
              }`} />
              <span className="text-[10px] text-muted">
                {syncStatus === 'synced' ? 'Synced' :
                 syncStatus === 'syncing' ? 'Syncing...' :
                 syncStatus === 'restoring' ? 'Restoring...' :
                 syncStatus === 'error' ? 'Sync error' :
                 syncStatus === 'offline' ? 'Offline' : 'Idle'}
              </span>
            </div>
            {pendingChanges > 0 && (
              <span className="text-[10px] font-medium text-amber-400">{pendingChanges} pending</span>
            )}
            <button onClick={doSync} className="p-0.5 rounded hover:bg-hover text-muted hover:text-primary transition-colors cursor-pointer border-0 bg-transparent text-[10px]" title="Sync now">
              ↻
            </button>
          </div>
          {showInstall && installPrompt && (
            <button onClick={handleInstall}
              className="flex items-center gap-1.5 w-full px-2 py-1.5 rounded-lg bg-purple-500/15 text-purple-300 text-[10px] font-medium hover:bg-purple-500/25 transition-all cursor-pointer border-0">
              <Download size={12} />
              Install App
            </button>
          )}
        </div>
        <div className="p-4 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-3">
            <Avatar src={profile?.photoURL} name={profile?.fullName} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{profile?.fullName || 'User'}</p>
              <p className="text-xs text-muted">Lvl {profile?.level || 1}</p>
            </div>
            {isPremium && (
              <span className="text-xs font-semibold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">PRO</span>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
