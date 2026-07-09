import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, X, CheckCheck, ExternalLink, Info, AlertTriangle, CheckCircle, UserPlus, Calendar } from 'lucide-react'
import { useNotifications } from '../../contexts/NotificationContext'
import { format, parseISO, formatDistanceToNow } from 'date-fns'

const TYPE_ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  connection: UserPlus,
  exam: Calendar,
  deadline: Calendar,
  achievement: CheckCircle
}

const TYPE_COLORS = {
  info: 'text-blue-500 bg-blue-500/20',
  warning: 'text-amber-500 bg-amber-500/20',
  success: 'text-green-500 bg-green-500/20',
  connection: 'text-purple-500 bg-purple-500/20',
  exam: 'text-red-500 bg-red-500/20',
  deadline: 'text-orange-500 bg-orange-500/20',
  achievement: 'text-yellow-500 bg-yellow-500/20'
}

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, unreadCount, markRead, markAllRead, dismiss, clearAll } = useNotifications()
  const navigate = useNavigate()
  const ref = useRef()

  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose() }
    setTimeout(() => document.addEventListener('click', handler), 0)
    return () => document.removeEventListener('click', handler)
  }, [isOpen, onClose])

  const handleClick = (n) => {
    markRead(n.id)
    if (n.link) navigate(n.link)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div ref={ref} className="absolute top-full right-0 mt-2 w-80 max-h-96 overflow-hidden rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-theme-lg z-50">
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-color)]">
        <h3 className="text-sm font-semibold text-primary">Notifications</h3>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && <button onClick={markAllRead} className="p-1.5 rounded hover:bg-hover text-muted hover:text-primary cursor-pointer border-0 bg-transparent" title="Mark all read"><CheckCheck size={14} /></button>}
          <button onClick={clearAll} className="p-1.5 rounded hover:bg-hover text-muted hover:text-red-400 cursor-pointer border-0 bg-transparent" title="Clear all"><X size={14} /></button>
        </div>
      </div>
      <div className="overflow-y-auto max-h-72">
        {notifications.length === 0 && (
          <div className="p-6 text-center text-xs text-muted">
            <Bell size={24} className="mx-auto mb-2 opacity-40" />
            No notifications yet
          </div>
        )}
        {notifications.map(n => {
          const Icon = TYPE_ICONS[n.type] || Info
          const colorClass = TYPE_COLORS[n.type] || TYPE_COLORS.info
          return (
            <div key={n.id}
              className={`flex items-start gap-3 p-3 border-b border-[var(--border-color)] cursor-pointer transition-colors hover:bg-hover ${n.read ? 'opacity-60' : ''}`}
              onClick={() => handleClick(n)}
            >
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                <Icon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-primary">{n.title}</p>
                {n.message && <p className="text-[10px] text-muted mt-0.5">{n.message}</p>}
                <p className="text-[9px] text-muted mt-1">
                  {formatDistanceToNow(parseISO(n.createdAt), { addSuffix: true })}
                </p>
              </div>
              {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] flex-shrink-0 mt-1" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
