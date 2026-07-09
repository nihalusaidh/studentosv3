import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../ui/GlassCard'
import { Flame, Sparkles, ListChecks, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

export default function HabitWidget() {
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])

  useEffect(() => {
    try { setHabits(JSON.parse(localStorage.getItem('habits') || '[]')) }
    catch { setHabits([]) }
    const interval = setInterval(() => {
      try { setHabits(JSON.parse(localStorage.getItem('habits') || '[]')) }
      catch { setHabits([]) }
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const activeHabits = habits.filter(h => !h.isArchived)
  const today = format(new Date(), 'yyyy-MM-dd')
  const todayHabits = activeHabits.filter(h => {
    if (h.frequency === 'daily') return true
    if (h.frequency === 'custom' && h.customDays?.length) return h.customDays.includes(new Date().getDay())
    if (h.frequency === 'onetime') return !h.completedDates?.[today]?.completed && !Object.keys(h.completedDates || {}).length
    return true
  })
  const completedToday = todayHabits.filter(h => h.completedDates?.[today]?.completed).length
  const totalToday = todayHabits.length
  const maxStreak = activeHabits.reduce((max, h) => Math.max(max, h.streak || 0), 0)
  const percent = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0

  if (activeHabits.length === 0) return null

  return (
    <GlassCard className="p-4 relative overflow-hidden group cursor-pointer" onClick={() => navigate('/habits')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ListChecks size={16} className="text-[var(--accent)]" />
          <h3 className="text-sm font-semibold text-primary">Habits</h3>
        </div>
        <ChevronRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
      </div>

      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 flex-shrink-0">
          <svg width="56" height="56" viewBox="0 0 56 56" className="transform -rotate-90">
            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--bg-secondary)" strokeWidth="5" />
            <circle cx="28" cy="28" r="24" fill="none" stroke="var(--accent)" strokeWidth="5" strokeLinecap="round"
              strokeDasharray="150.8" strokeDashoffset={150.8 * (1 - percent / 100)}
              style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">{completedToday}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-muted">
              <Flame size={12} className="text-orange-500" /> {maxStreak}d
            </span>
            <span className="text-muted">{completedToday}/{totalToday} today</span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-green-500"
              style={{ width: `${percent}%`, transition: 'width 0.8s ease' }} />
          </div>
        </div>
      </div>

      {todayHabits.length > 0 && todayHabits.length - completedToday > 0 && (
        <div className="mt-3 space-y-1">
          {todayHabits.filter(h => !h.completedDates?.[today]?.completed).slice(0, 3).map(h => (
            <div key={h.id} className="flex items-center gap-2 text-[11px] text-muted">
              <span>{h.emoji}</span>
              <span className="truncate">{h.name}</span>
            </div>
          ))}
          {todayHabits.length - completedToday > 3 && (
            <p className="text-[10px] text-muted">+{todayHabits.length - completedToday - 3} more</p>
          )}
        </div>
      )}
    </GlassCard>
  )
}
