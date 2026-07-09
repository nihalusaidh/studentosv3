import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Flame, CalendarDays } from 'lucide-react'
import { useHabits } from '../../contexts/HabitContext'
import GlassCard from '../ui/GlassCard'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, addMonths, subMonths } from 'date-fns'

export default function HabitCalendar() {
  const { activeHabits } = useHabits()
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  const stats = useMemo(() => {
    const completed = {}
    const streaks = {}
    activeHabits.forEach(h => {
      Object.entries(h.completedDates || {}).forEach(([d, e]) => {
        if (e.completed) completed[d] = (completed[d] || 0) + 1
      })
    })

    const today = new Date()
    days.forEach(d => {
      const ds = format(d, 'yyyy-MM-dd')
      if (ds >= format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd') && completed[ds]) {
        streaks[ds] = completed[ds]
      }
    })

    return { completed, streaks }
  }, [activeHabits, days])

  const totalCompleted = Object.keys(stats.completed).filter(d => d.startsWith(format(currentMonth, 'yyyy-MM'))).length
  const habitCount = activeHabits.length

  const getIntensity = (dateStr) => {
    const c = stats.completed[dateStr] || 0
    if (c === 0) return 0
    const max = Math.max(...Object.values(stats.completed), 1)
    return Math.min(c / max, 1)
  }

  const startPadding = getDay(days[0])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays size={16} className="text-[var(--accent)]" />
          <span className="text-sm font-medium text-primary">{format(currentMonth, 'MMMM yyyy')}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-muted transition-all cursor-pointer border-0 bg-transparent">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="px-2 py-1 rounded-lg text-[10px] text-[var(--accent)] hover:bg-[var(--accent)]/10 transition-all cursor-pointer border-0 bg-transparent">
            Today
          </button>
          <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-1.5 rounded-lg hover:bg-[var(--bg-secondary)] text-muted transition-all cursor-pointer border-0 bg-transparent">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-[10px] text-muted text-center py-1 font-medium">{d}</div>
        ))}
        {Array.from({ length: startPadding }).map((_, i) => (
          <div key={`pad-${i}`} />
        ))}
        {days.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const isToday = isSameDay(day, new Date())
          const intensity = getIntensity(dateStr)
          const isCompleted = !!stats.completed[dateStr]

          return (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.005 }}
              className={`relative aspect-square rounded-lg flex items-center justify-center text-xs transition-all ${
                isToday ? 'ring-2 ring-[var(--accent)]' : ''
              } ${
                intensity > 0
                  ? `bg-[var(--accent)]/${Math.round(intensity * 40)}`
                  : 'bg-[var(--bg-secondary)]'
              }`}
            >
              <span className={`font-medium z-10 text-[11px] ${
                isToday ? 'text-[var(--accent)]' : intensity > 0.5 ? 'text-white' : 'text-secondary'
              }`}>
                {format(day, 'd')}
              </span>
              {isCompleted && (
                <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--success)]" />
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-muted pt-1">
        <span>{totalCompleted} completions this month</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-[var(--bg-secondary)]" />
            <span>None</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-[var(--accent)]/20" />
            <span>Some</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2.5 h-2.5 rounded bg-[var(--accent)]/60" />
            <span>Most</span>
          </div>
        </div>
      </div>
    </div>
  )
}
