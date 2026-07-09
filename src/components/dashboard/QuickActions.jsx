import { useNavigate } from 'react-router-dom'
import { CalendarCheck, BarChart3, Bell, Upload, Sparkles, Clock } from 'lucide-react'

const actions = [
  { path: '/attendance', label: 'Attendance', icon: CalendarCheck, color: 'from-blue-500 to-blue-600' },
  { path: '/internals', label: 'Marks', icon: BarChart3, color: 'from-purple-500 to-purple-600' },
  { path: '/calendar', label: 'Reminder', icon: Bell, color: 'from-rose-500 to-rose-600' },
  { path: '/notes', label: 'Upload Notes', icon: Upload, color: 'from-emerald-500 to-emerald-600' },
  { path: '/ai', label: 'Ask AI', icon: Sparkles, color: 'from-amber-500 to-amber-600' },
  { path: '/focus', label: 'Focus Timer', icon: Clock, color: 'from-cyan-500 to-cyan-600' }
]

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <div>
      <h3 className="text-sm font-semibold text-primary mb-3">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {actions.map(({ path, label, icon: Icon, color }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[var(--bg-glass)] border border-[var(--glass-border)] hover:bg-hover transition-all duration-200 cursor-pointer"
          >
            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center`}>
              <Icon size={16} className="text-white" />
            </div>
            <span className="text-[11px] font-medium text-secondary text-center leading-tight">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
