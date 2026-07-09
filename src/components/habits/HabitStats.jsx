import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import AnimatedCounter from './AnimatedCounter'
import { useHabits } from '../../contexts/HabitContext'
import { useTheme } from '../../contexts/ThemeContext'
import { Flame, CalendarDays, TrendingUp, Target, Trophy, Zap } from 'lucide-react'

const STATS_GRID = [
  { key: 'totalStreak', icon: Flame, label: 'Best Streak', color: 'text-orange-500', bg: 'bg-orange-500/20', suffix: 'd', accent: '#f97316' },
  { key: 'completionCount', icon: CalendarDays, label: 'Done Today', color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/20', suffix: '', accent: '#22c55e' },
  { key: 'weeklyRate', icon: TrendingUp, label: 'Weekly Rate', color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/20', suffix: '%', accent: 'var(--accent)' },
  { key: 'activeHabits', icon: Target, label: 'Active', color: 'text-blue-500', bg: 'bg-blue-500/20', suffix: '', accent: '#3b82f6' }
]

export default function HabitStats() {
  const { streakData, analytics } = useHabits()
  const { currentTheme } = useTheme()
  const statLayout = currentTheme?.vars?.['--stat-layout'] || 'grid'

  const values = {
    totalStreak: streakData.totalStreak || 0,
    completionCount: streakData.completionCount || 0,
    weeklyRate: analytics?.weeklyRate || 0,
    activeHabits: analytics?.activeHabits || 0,
    monthlyRate: analytics?.monthlyRate || 0,
    bestStreak: streakData.bestStreak || 0
  }

  /* ── INLINE variant (minimal, amoled) ── */
  if (statLayout === 'inline') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary">
        <span className="flex items-center gap-1"><Flame size={12} className="text-orange-500" /> <AnimatedCounter value={values.totalStreak} suffix="d" duration={1} /></span>
        <span className="flex items-center gap-1"><CalendarDays size={12} className="text-[var(--success)]" /> <AnimatedCounter value={values.completionCount} suffix=" today" duration={1} /></span>
        <span className="flex items-center gap-1"><TrendingUp size={12} className="text-[var(--accent)]" /> <AnimatedCounter value={values.weeklyRate} suffix="%" duration={1} /> weekly</span>
        <span className="flex items-center gap-1"><Target size={12} className="text-blue-500" /> <AnimatedCounter value={values.activeHabits} suffix=" active" duration={1} /></span>
      </motion.div>
    )
  }

  /* ── TABLE variant (retro) ── */
  if (statLayout === 'table') {
    return (
      <GlassCard className="p-3 font-mono" style={{ fontFamily: "'Courier New', monospace" }}>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {[
            { label: 'Best Streak', value: `${values.totalStreak}d`, icon: Flame },
            { label: 'Done Today', value: `${values.completionCount}`, icon: CalendarDays },
            { label: 'Weekly Rate', value: `${values.weeklyRate}%`, icon: TrendingUp },
            { label: 'Active Habits', value: `${values.activeHabits}`, icon: Target }
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-1.5 border border-[var(--border-color)]"
            >
              <span className="text-muted">│ {s.label}</span>
              <span className="font-bold text-primary">{s.value}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    )
  }

  /* ── PILLS variant (forest) ── */
  if (statLayout === 'pills') {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
        {[
          { label: 'Streak', value: `${values.totalStreak}d`, icon: Flame, color: 'text-orange-500', bg: 'bg-orange-500/15' },
          { label: 'Today', value: `${values.completionCount}`, icon: CalendarDays, color: 'text-[var(--success)]', bg: 'bg-[var(--success)]/15' },
          { label: 'Weekly', value: `${values.weeklyRate}%`, icon: TrendingUp, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent)]/15' },
          { label: 'Active', value: `${values.activeHabits}`, icon: Target, color: 'text-blue-500', bg: 'bg-blue-500/15' }
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 300, damping: 20 }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full ${s.bg} text-xs`}
          >
            <s.icon size={12} className={s.color} />
            <span className="text-primary font-semibold"><AnimatedCounter value={i === 3 ? values.activeHabits : i === 1 ? values.completionCount : i === 2 ? values.weeklyRate : values.totalStreak} suffix={i === 0 ? 'd' : i === 2 ? '%' : ''} duration={1} /></span>
            <span className="text-muted">{s.label}</span>
          </motion.div>
        ))}
      </motion.div>
    )
  }

  /* ── ROW variant (ocean) ── */
  if (statLayout === 'row') {
    return (
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
        {STATS_GRID.map(({ key, icon: Icon, label, color, bg, suffix, accent }, i) => (
          <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06, type: 'spring', stiffness: 300 }}
            className="flex-shrink-0 min-w-[120px]"
          >
            <GlassCard className="p-2.5">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}><Icon size={14} className={color} /></div>
                <div>
                  <p className="text-sm font-bold text-primary tabular-nums"><AnimatedCounter value={values[key]} suffix={suffix} duration={1.2} /></p>
                  <p className="text-[9px] text-muted">{label}</p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    )
  }

  /* ── GRID variant (default) ── */
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {STATS_GRID.map(({ key, icon: Icon, label, color, bg, suffix, accent }, i) => (
        <motion.div key={key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 22 }}
        >
          <GlassCard className="p-3.5 relative overflow-hidden group">
            <motion.div className="absolute -top-6 -right-6 w-16 h-16 rounded-full opacity-10" style={{ backgroundColor: accent }}
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 + i * 0.08 }} />
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0 relative`}>
                <Icon size={18} className={color} />
              </div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-primary tabular-nums">
                  <AnimatedCounter value={values[key]} suffix={suffix} duration={1.2} />
                </p>
                <p className="text-[10px] text-muted truncate">{label}</p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  )
}
