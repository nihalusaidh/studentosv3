import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import { useHabits } from '../../contexts/HabitContext'
import { TrendingUp, PieChart, BarChart3, Flame, Brain, Lightbulb } from 'lucide-react'

export default function HabitAnalytics() {
  const { activeHabits, analytics } = useHabits()
  const [chartType, setChartType] = useState('bar')

  const categoryData = useMemo(() => {
    const map = {}
    activeHabits.forEach(h => {
      if (!map[h.category]) map[h.category] = { total: 0, completed: 0, name: h.category }
      map[h.category].total++
      const today = new Date().toISOString().split('T')[0]
      if (h.completedDates?.[today]?.completed) map[h.category].completed++
    })
    return Object.values(map).sort((a, b) => b.total - a.total)
  }, [activeHabits])

  const topHabits = useMemo(() => {
    return [...activeHabits]
      .sort((a, b) => (b.streak || 0) - (a.streak || 0))
      .slice(0, 5)
  }, [activeHabits])

  const weakHabits = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return activeHabits
      .filter(h => !h.completedDates?.[today]?.completed)
      .sort((a, b) => (a.streak || 0) - (b.streak || 0))
      .slice(0, 3)
  }, [activeHabits, analytics])

  const consistencyScore = analytics?.weeklyRate || 0

  const maxCategory = Math.max(...categoryData.map(c => c.total), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-primary">Analytics</h3>
        <div className="flex gap-1">
          {[
            { value: 'bar', icon: BarChart3 },
            { value: 'pie', icon: PieChart }
          ].map(({ value, icon: Icon }) => (
            <button key={value} onClick={() => setChartType(value)}
              className={`p-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                chartType === value ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'text-muted hover:bg-[var(--bg-secondary)]'
              }`}
            ><Icon size={14} /></button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <GlassCard className="p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={14} className="text-[var(--success)]" />
            <span className="text-[11px] font-medium text-primary">Consistency</span>
          </div>
          <motion.div
            className="text-2xl font-bold text-primary"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >{consistencyScore}%</motion.div>
          <div className="w-full h-1.5 rounded-full bg-[var(--bg-secondary)] mt-2 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--success)]"
              initial={{ width: 0 }}
              animate={{ width: `${consistencyScore}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
          <p className="text-[10px] text-muted mt-1">Weekly completion rate</p>
        </GlassCard>

        <GlassCard className="p-3.5">
          <div className="flex items-center gap-2 mb-2">
            <Flame size={14} className="text-orange-500" />
            <span className="text-[11px] font-medium text-primary">Streaks</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <motion.span className="text-2xl font-bold text-primary" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.1 }}>
              {activeHabits.reduce((max, h) => Math.max(max, h.streak || 0), 0)}
            </motion.span>
            <span className="text-[11px] text-muted">best streak</span>
          </div>
          <p className="text-[10px] text-muted mt-1">{activeHabits.filter(h => (h.streak || 0) > 0).length} habits active</p>
        </GlassCard>
      </div>

      <GlassCard className="p-3.5">
        <div className="flex items-center gap-2 mb-3">
          <PieChart size={14} className="text-[var(--accent)]" />
          <span className="text-[11px] font-medium text-primary">Category Breakdown</span>
        </div>
        <div className="space-y-2">
          {categoryData.map((cat, i) => (
            <motion.div key={cat.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="capitalize text-secondary">{cat.name}</span>
                <span className="text-primary font-medium">{cat.completed}/{cat.total}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.total / maxCategory) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                  style={{ backgroundColor: ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6'][i % 6] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      {weakHabits.length > 0 && (
        <GlassCard className="p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb size={14} className="text-amber-500" />
            <span className="text-[11px] font-medium text-primary">Needs Attention</span>
          </div>
          <div className="space-y-2">
            {weakHabits.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-[11px]"
              >
                <span>{h.emoji}</span>
                <span className="flex-1 text-secondary truncate">{h.name}</span>
                <span className="text-muted">{h.streak || 0}d streak</span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}

      {topHabits.length > 0 && (
        <GlassCard className="p-3.5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-amber-500" />
            <span className="text-[11px] font-medium text-primary">Top Streaks</span>
          </div>
          <div className="space-y-2">
            {topHabits.map((h, i) => (
              <motion.div key={h.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-2 text-[11px]"
              >
                <span className="w-4 text-[10px] text-muted">#{i + 1}</span>
                <span>{h.emoji}</span>
                <span className="flex-1 text-secondary truncate">{h.name}</span>
                <span className="flex items-center gap-0.5 text-amber-500 font-medium">
                  <Flame size={12} /> {h.streak || 0}d
                </span>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  )
}
