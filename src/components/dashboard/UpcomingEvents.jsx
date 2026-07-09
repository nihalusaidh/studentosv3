import { useEffect, useState } from 'react'
import { getUpcomingDeadlines } from '../../utils/calendarStorage'
import GlassCard from '../ui/GlassCard'
import { format, parseISO } from 'date-fns'
import { Calendar, Clock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function UpcomingEvents() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])

  useEffect(() => {
    function refresh() {
      const all = getUpcomingDeadlines(7)
      const now = new Date()
      const upcoming = all
        .filter(e => new Date(e.date + 'T' + (e.startTime || '00:00')) >= now)
        .sort((a, b) => a.date.localeCompare(b.date) || (a.startTime || '').localeCompare(b.startTime || ''))
        .slice(0, 3)
      setEvents(upcoming)
    }
    refresh()
    const interval = setInterval(refresh, 2000)
    return () => clearInterval(interval)
  }, [])

  if (events.length === 0) return null

  return (
    <GlassCard className="p-4 cursor-pointer" onClick={() => navigate('/calendar')}>
      <h3 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
        <Calendar size={16} className="text-[var(--accent)]" />
        Upcoming
      </h3>
      <div className="space-y-2">
        {events.map(event => (
          <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg bg-[var(--bg-secondary)]">
            <div className="w-1.5 h-8 rounded-full" style={{ background: event.color || 'var(--accent)' }} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-primary truncate">{event.title}</p>
              <div className="flex items-center gap-2 text-xs text-muted">
                <span>{format(parseISO(event.date), 'MMM d')}</span>
                {event.startTime && <><Clock size={12} /><span>{event.startTime}</span></>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  )
}
