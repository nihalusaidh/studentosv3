import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CalendarCheck, BarChart3, Calendar, ListTodo, Sparkles } from 'lucide-react'

const items = [
  { path: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/internals', label: 'Marks', icon: BarChart3 },
  { path: '/tasks', label: 'Tasks', icon: ListTodo },
  { path: '/calendar', label: 'Calendar', icon: Calendar },
  { path: '/ai', label: 'AI', icon: Sparkles }
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden
      bg-[var(--navbar-bg)] backdrop-blur-xl
      border-t border-[var(--border-color)]">
      <div className="flex items-center gap-1 px-2 py-1 overflow-x-auto scrollbar-none">
        {items.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2.5 py-2 rounded-lg transition-all duration-200 flex-shrink-0
              ${isActive
                ? 'text-[var(--accent)]'
                : 'text-muted hover:text-secondary'
              }`
            }
          >
            <Icon size={18} />
            <span className="text-[9px] font-medium whitespace-nowrap">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
