import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useHabits } from '../../contexts/HabitContext'
import { useTheme } from '../../contexts/ThemeContext'
import GlassCard from '../ui/GlassCard'

const CAT_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#22c55e', '#14b8a6', '#06b6d4', '#eab308']
const CAT_EMOJIS = { health: '💪', mind: '🧠', fitness: '🏃', study: '📚', work: '💼', social: '🤝', finance: '💰', custom: '⚡' }

export default function CategoryChart() {
  const { activeHabits } = useHabits()
  const { currentTheme } = useTheme()
  const catStyle = currentTheme?.vars?.['--category-style'] || 'hbar'

  const categories = useMemo(() => {
    const map = {}
    const today = new Date().toISOString().split('T')[0]
    activeHabits.forEach((h, idx) => {
      if (!map[h.category]) map[h.category] = { name: h.category, total: 0, completed: 0, color: CAT_COLORS[idx % CAT_COLORS.length] }
      map[h.category].total++
      if (h.completedDates?.[today]?.completed) map[h.category].completed++
    })
    return Object.values(map)
  }, [activeHabits])

  const maxTotal = Math.max(...categories.map(c => c.total), 1)
  if (categories.length === 0) return null

  /* ── TABLE variant (retro) ── */
  if (catStyle === 'table') {
    return (
      <GlassCard className="p-4 habits-chart font-mono" style={{ fontFamily: "'Courier New', monospace" }}>
        <h3 className="text-sm font-semibold text-primary mb-3">Category Breakdown</h3>
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2 text-muted border-b border-[var(--border-color)] pb-1 mb-1">
            <span className="w-6">Cat</span>
            <span className="flex-1">Progress</span>
            <span className="w-10 text-right">Done</span>
            <span className="w-6 text-right">%</span>
          </div>
          {categories.map((cat, i) => (
            <motion.div key={cat.name} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 py-0.5"
            >
              <span className="w-6 text-muted">{cat.name.slice(0, 3)}</span>
              <span className="flex-1 text-[var(--accent)]">
                {'█'.repeat(cat.total)}{'░'.repeat(maxTotal - cat.total)}
              </span>
              <span className="w-10 text-right text-primary">{cat.completed}/{cat.total}</span>
              <span className="w-6 text-right text-muted">{cat.total > 0 ? Math.round((cat.completed / cat.total) * 100) : 0}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    )
  }

  /* ── COMPACT variant (minimal, amoled) ── */
  if (catStyle === 'compact') {
    return (
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Category Breakdown</h3>
        <div className="space-y-2">
          {categories.map((cat, i) => (
            <motion.div key={cat.name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className="flex items-center gap-2 text-xs"
            >
              <span>{CAT_EMOJIS[cat.name] || '📌'}</span>
              <span className="w-16 capitalize text-secondary">{cat.name}</span>
              <span className="flex-1 text-right text-muted">{cat.completed}/{cat.total}</span>
              <span className="w-8 h-1.5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ backgroundColor: cat.color, width: `${(cat.total / maxTotal) * 100}%` }}
                  initial={{ width: 0 }} animate={{ width: `${(cat.total / maxTotal) * 100}%` }} transition={{ duration: 0.6, delay: i * 0.05 }} />
              </span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    )
  }

  /* ── VBAR variant (neon, aurora) ── */
  if (catStyle === 'vbar') {
    const barH = 120
    return (
      <GlassCard className="p-4 habits-chart">
        <h3 className="text-sm font-semibold text-primary mb-3">Category Breakdown</h3>
        <div className="flex items-end justify-around gap-2" style={{ height: barH }}>
          {categories.map((cat, i) => {
            const pct = (cat.total / maxTotal) * 100
            return (
              <motion.div key={cat.name} className="flex flex-col items-center gap-1 flex-1"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              >
                <span className="text-[9px] text-muted">{cat.completed}/{cat.total}</span>
                <motion.div
                  className="w-full rounded-t-lg relative overflow-hidden"
                  style={{ backgroundColor: cat.color + '20', height: barH - 20 }}
                  initial={{ height: 0 }}
                  animate={{ height: barH - 20 }}
                  transition={{ duration: 0.8, delay: i * 0.08 }}
                >
                  <motion.div
                    className="absolute bottom-0 w-full rounded-t-lg"
                    style={{ backgroundColor: cat.color, height: `${pct}%` }}
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                  />
                </motion.div>
                <span className="text-[9px] capitalize text-muted">{CAT_EMOJIS[cat.name] || cat.name.slice(0, 3)}</span>
              </motion.div>
            )
          })}
        </div>
      </GlassCard>
    )
  }

  /* ── VPILL variant (forest) ── */
  if (catStyle === 'vpill') {
    return (
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Category Breakdown</h3>
        <div className="space-y-3">
          {categories.map((cat, i) => {
            const pct = cat.total > 0 ? (cat.completed / cat.total) * 100 : 0
            return (
              <motion.div key={cat.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="flex items-center gap-1.5">
                    <span>{CAT_EMOJIS[cat.name] || '📌'}</span>
                    <span className="capitalize text-secondary font-medium">{cat.name}</span>
                  </span>
                  <span className="text-muted">{cat.completed}/{cat.total}</span>
                </div>
                <div className="h-5 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full flex items-center justify-end px-2"
                    style={{ backgroundColor: cat.color, width: `${(cat.total / maxTotal) * 100}%` }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.total / maxTotal) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }}
                  >
                    {pct > 0 && (
                      <motion.span
                        className="text-[8px] text-white font-medium"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 + i * 0.08 }}
                      >{Math.round(pct)}%</motion.span>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </GlassCard>
    )
  }

  /* ── HBAR variant (default) ── */
  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-primary mb-3">Category Breakdown</h3>
      <div className="space-y-2.5">
        {categories.map((cat, i) => (
          <motion.div key={cat.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm">{CAT_EMOJIS[cat.name] || '📌'}</span>
                <span className="text-xs capitalize text-secondary font-medium">{cat.name}</span>
              </div>
              <span className="text-[10px] text-muted"><span className="text-primary font-medium">{cat.completed}</span>/{cat.total}</span>
            </div>
            <div className="relative h-3 rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <motion.div className="absolute inset-y-0 left-0 rounded-full" style={{ backgroundColor: cat.color, width: `${(cat.total / maxTotal) * 100}%` }}
                initial={{ width: 0 }} animate={{ width: `${(cat.total / maxTotal) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.08, ease: 'easeOut' }} />
              {cat.completed > 0 && (
                <motion.div className="absolute inset-y-0 left-0 rounded-full bg-white/30"
                  style={{ width: `${(cat.completed / cat.total) * (cat.total / maxTotal) * 100}%` }}
                  initial={{ width: 0 }} animate={{ width: `${(cat.completed / cat.total) * (cat.total / maxTotal) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: 'easeOut' }} />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  )
}
