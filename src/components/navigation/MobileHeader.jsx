import { useState } from 'react'
import { Menu, Bell, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { useNotifications } from '../../contexts/NotificationContext'
import NotificationPanel from '../dashboard/NotificationPanel'

const LIGHT_THEMES = ['academic', 'minimal', 'sunrise', 'lavender', 'fresh']

export default function MobileHeader({ onMenuClick }) {
  const { currentThemeId, changeTheme } = useTheme()
  const { unreadCount } = useNotifications()
  const [showNotif, setShowNotif] = useState(false)

  const isLight = LIGHT_THEMES.includes(currentThemeId)

  const toggleTheme = () => {
    changeTheme(isLight ? 'glass' : 'academic')
  }

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--navbar-bg)] backdrop-blur-xl border-b border-[var(--border-color)] sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="p-1.5 rounded-lg hover:bg-hover text-secondary cursor-pointer border-0 bg-transparent">
          <Menu size={22} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-bg flex items-center justify-center">
            <span className="text-white font-bold text-xs">S</span>
          </div>
          <span className="font-bold text-base gradient-text">Student OS</span>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={toggleTheme} className="p-1.5 rounded-lg hover:bg-hover text-secondary cursor-pointer border-0 bg-transparent" title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}>
          {isLight ? <Moon size={18} /> : <Sun size={18} />}
        </button>
        <div className="relative">
          <button onClick={() => setShowNotif(!showNotif)} className="p-1.5 rounded-lg hover:bg-hover text-secondary relative cursor-pointer border-0 bg-transparent">
            <Bell size={20} />
            {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500" />}
          </button>
          <NotificationPanel isOpen={showNotif} onClose={() => setShowNotif(false)} />
        </div>
      </div>
    </header>
  )
}
