import { motion } from 'framer-motion'
import { useHabits } from '../../contexts/HabitContext'
import { useTheme } from '../../contexts/ThemeContext'
import GlassCard from '../ui/GlassCard'
import { Target, Flame, CalendarDays, TrendingUp } from 'lucide-react'

export default function ConsistencyGauge() {
  const { analytics, streakData } = useHabits()
  const { currentTheme } = useTheme()
  const gaugeStyle = currentTheme?.vars?.['--gauge-style'] || 'semicircle'
  const score = analytics?.weeklyRate || 0

  /* ── TEXT variant (minimal, amoled, retro) ── */
  if (gaugeStyle === 'text') {
    return (
      <GlassCard className="p-4">
        <div className="flex items-center gap-6">
          <div className="text-center">
            <motion.p className="text-4xl font-bold text-primary tabular-nums"
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >{score}<span className="text-xl text-muted">%</span></motion.p>
            <p className="text-[10px] text-muted mt-1">consistency</p>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2 text-xs">
            {[
              { label: 'Best streak', value: `${streakData.bestStreak || 0}d` },
              { label: 'Monthly rate', value: `${analytics?.monthlyRate || 0}%` },
              { label: 'Active', value: `${analytics?.activeHabits || 0}` },
              { label: 'Today', value: `${streakData.completionCount || 0}` }
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                className="p-1.5 rounded-lg bg-[var(--bg-secondary)]"
              >
                <p className="text-muted">{s.label}</p>
                <p className="font-semibold text-primary">{s.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>
    )
  }

  /* ── FULLCIRCLE variant (aurora, neon) ── */
  if (gaugeStyle === 'fullcircle') {
    const r = 60; const circ = 2 * Math.PI * r; const off = circ * (1 - score / 100)
    return (
      <GlassCard className="p-4 relative overflow-hidden">
        <h3 className="text-sm font-semibold text-primary mb-3">Consistency Score</h3>
        <div className="flex items-center justify-center gap-8">
          <div className="relative">
            <svg width="160" height="160" viewBox="0 0 160 160">
              <defs>
                <linearGradient id="fullGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ef4444" /><stop offset="50%" stopColor="#eab308" /><stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <filter id="glowRing"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              </defs>
              <circle cx="80" cy="80" r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth="8" />
              <motion.circle cx="80" cy="80" r={r} fill="none" stroke="url(#fullGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }}
                transition={{ duration: 1.5, ease: 'easeOut', type: 'spring', stiffness: 40, damping: 15 }}
                filter={score >= 80 ? 'url(#glowRing)' : undefined} transform="rotate(-90 80 80)" />
            </svg>
            <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <span className="text-2xl font-bold text-primary">{score}%</span>
              <span className="text-[9px] text-muted">weekly</span>
            </motion.div>
          </div>
        </div>
      </GlassCard>
    )
  }

  /* ── DONUT variant (forest) ── */
  if (gaugeStyle === 'donut') {
    const r = 54; const circ = 2 * Math.PI * r; const off = circ * (1 - score / 100)
    return (
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-primary mb-3">Consistency Score</h3>
        <div className="flex items-center gap-8">
          <div className="relative flex-shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <defs>
                <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22c55e" /><stop offset="100%" stopColor="#14b8a6" />
                </linearGradient>
              </defs>
              <circle cx="70" cy="70" r={r} fill="none" stroke="var(--bg-secondary)" strokeWidth="12" />
              <motion.circle cx="70" cy="70" r={r} fill="none" stroke="url(#donutGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }}
                transition={{ duration: 1.5, ease: 'easeOut' }} transform="rotate(-90 70 70)" />
            </svg>
            <motion.div className="absolute inset-0 flex flex-col items-center justify-center"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
              <Target size={18} className="text-[var(--accent)]" />
              <span className="text-lg font-bold text-primary mt-1">{score}%</span>
            </motion.div>
          </div>
          <div className="flex-1 space-y-1.5 text-xs">
            {[
              { icon: Flame, label: 'Best streak', value: `${streakData.bestStreak || 0}d`, color: 'text-orange-500' },
              { icon: TrendingUp, label: 'Monthly', value: `${analytics?.monthlyRate || 0}%`, color: 'text-[var(--accent)]' },
              { icon: CalendarDays, label: 'Active', value: `${analytics?.activeHabits || 0}`, color: 'text-blue-500' }
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-secondary)]"
              >
                <s.icon size={12} className={s.color} />
                <span className="flex-1 text-muted">{s.label}</span>
                <span className="font-semibold text-primary">{s.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>
    )
  }

  /* ── NEEDLE variant (ocean) ── */
  if (gaugeStyle === 'needle') {
    const angle = -90 + (score / 100) * 180; const rad = (angle * Math.PI) / 180
    const nLen = 60; const cx = 90; const cy = 85
    const nx = cx + nLen * Math.cos(rad); const ny = cy + nLen * Math.sin(rad)
    return (
      <GlassCard className="p-4">
        <h3 className="text-sm font-semibold text-primary mb-2">Consistency Score</h3>
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg width="180" height="110" viewBox="0 0 180 110">
              <defs><linearGradient id="needleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ef4444" /><stop offset="50%" stopColor="#eab308" /><stop offset="100%" stopColor="#22c55e" />
              </linearGradient></defs>
              <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="var(--bg-secondary)" strokeWidth="12" strokeLinecap="round" />
              <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="url(#needleGrad)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={Math.PI * 80} strokeDashoffset={Math.PI * 80 * (1 - score / 100)} opacity="0.3" />
              <motion.line x1={cx} y1={cy} x2={nx} y2={ny} stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} />
              <circle cx={cx} cy={cy} r="4" fill="var(--accent)" />
              <motion.text x={cx} y={cy + 20} textAnchor="middle" fontSize="12" fontWeight="bold" fill="var(--text-primary)"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>{score}%</motion.text>
            </svg>
          </div>
          <div className="flex-1 space-y-2 text-xs">
            {[
              { label: 'Best streak', value: `${streakData.bestStreak || 0}d` },
              { label: 'Monthly rate', value: `${analytics?.monthlyRate || 0}%` },
              { label: 'Active habits', value: `${analytics?.activeHabits || 0}` }
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06 }}
                className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-secondary)]"
              >
                <span className="text-muted">{s.label}</span>
                <span className="font-semibold text-primary">{s.value}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </GlassCard>
    )
  }

  /* ── SEMICIRCLE variant (default) ── */
  const W = 200; const H = 120; const cx = W / 2; const cy = H - 10; const r = 80
  const circumference = Math.PI * r
  return (
    <GlassCard className="p-4">
      <h3 className="text-sm font-semibold text-primary mb-2">Consistency Score</h3>
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <defs><linearGradient id="semiGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4444" /><stop offset="50%" stopColor="#eab308" /><stop offset="100%" stopColor="#22c55e" />
            </linearGradient></defs>
            <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--bg-secondary)" strokeWidth="10" strokeLinecap="round" />
            <motion.path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="url(#semiGrad)" strokeWidth="10" strokeLinecap="round"
              strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference * (1 - Math.min(score, 100) / 100) }}
              transition={{ duration: 1.5, ease: 'easeOut', type: 'spring', stiffness: 40, damping: 15 }} />
          </svg>
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center pb-3"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <span className="text-xl font-bold text-primary">{score}%</span>
            <span className="text-[9px] text-muted">weekly</span>
          </motion.div>
        </div>
        <div className="flex-1 space-y-2 min-w-0 text-xs">
          {[
            { label: 'Best streak', value: `${streakData.bestStreak || 0}d` },
            { label: 'Monthly rate', value: `${analytics?.monthlyRate || 0}%` },
            { label: 'Active habits', value: `${analytics?.activeHabits || 0}` },
            { label: 'Today done', value: `${streakData.completionCount || 0}` }
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
              className="flex items-center justify-between"
            >
              <span className="text-muted">{s.label}</span>
              <span className="font-semibold text-primary">{s.value}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </GlassCard>
  )
}
