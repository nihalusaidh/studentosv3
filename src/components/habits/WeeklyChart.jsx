import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useHabits } from '../../contexts/HabitContext'
import { useTheme } from '../../contexts/ThemeContext'
import GlassCard from '../ui/GlassCard'
import { subDays, format } from 'date-fns'

export default function WeeklyChart() {
  const { activeHabits } = useHabits()
  const { currentTheme } = useTheme()
  const chartStyle = currentTheme?.vars?.['--chart-style'] || 'line'
  const chartAccent = currentTheme?.vars?.['--chart-accent'] || 'var(--accent)'
  const chartGrid = currentTheme?.vars?.['--chart-grid'] || 'rgba(255,255,255,0.06)'

  const data = useMemo(() => {
    const days = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i)
      const dateStr = format(d, 'yyyy-MM-dd')
      let completed = 0; let total = 0
      activeHabits.forEach(h => {
        if (h.completedDates?.[dateStr]) total++
        if (h.completedDates?.[dateStr]?.completed) completed++
      })
      days.push({ date: dateStr, day: format(d, 'EEE'), completed, total, isToday: i === 0 })
    }
    return days
  }, [activeHabits])

  const maxVal = Math.max(...data.map(d => d.completed), 1)
  const W = 280; const H = 140; const PAD = { top: 16, right: 8, bottom: 26, left: 24 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const points = data.map((d, i) => ({
    x: PAD.left + (i / Math.max(data.length - 1, 1)) * chartW,
    y: PAD.top + chartH - (d.completed / maxVal) * chartH, ...d
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = linePath + ` L ${points[points.length - 1].x} ${PAD.top + chartH} L ${points[0].x} ${PAD.top + chartH} Z`

  /* ── ASCII variant ── */
  if (chartStyle === 'ascii') {
    const barW = 8
    return (
      <GlassCard className="p-4 habits-chart">
        <h3 className="text-sm font-semibold text-primary mb-3">Weekly Progress</h3>
        <div className="space-y-2 font-mono" style={{ fontFamily: "'Courier New', monospace" }}>
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-8 text-muted">{d.day}</span>
              <span className="text-[var(--accent)]">
                {'█'.repeat(Math.max(d.completed, 0))}
              </span>
              <span className="text-muted w-4">{d.completed}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    )
  }

  /* ── DOTS variant ── */
  if (chartStyle === 'dots') {
    return (
      <GlassCard className="p-4 habits-chart">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary">Weekly Progress</h3>
          <span className="text-[10px] text-muted">{data.reduce((s, d) => s + d.completed, 0)}/{data.reduce((s, d) => s + d.total, 0)}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H - 10}`} className="w-full h-auto" style={{ maxHeight: '130px' }}>
          {points.map((p, i) => (
            <motion.g key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
              <motion.circle cx={p.x} cy={p.y} r="3" fill={p.isToday ? chartAccent : 'var(--text-muted)'}
                initial={{ r: 0 }} animate={{ r: 3 }} transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.5 + i * 0.06 }} />
              <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fill="var(--text-secondary)" fontWeight={p.isToday ? '600' : '400'}>{p.completed}</text>
              <text x={p.x} y={H - 16} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{p.day}</text>
            </motion.g>
          ))}
          <motion.path d={points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')} fill="none"
            stroke="var(--text-muted)" strokeWidth="0.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.8 }} />
        </svg>
      </GlassCard>
    )
  }

  /* ── WAVE variant ── */
  if (chartStyle === 'wave') {
    const wavePath = points.map((p, i) => {
      const next = points[Math.min(i + 1, points.length - 1)]
      const midX = (p.x + next.x) / 2
      const midY = (p.y + next.y) / 2 - 4
      return `${i === 0 ? 'M' : 'Q'} ${p.x} ${p.y} ${midX} ${midY}`
    }).join(' ')
    const waveArea = wavePath + ` L ${points[points.length - 1].x} ${PAD.top + chartH} L ${points[0].x} ${PAD.top + chartH} Z`
    return (
      <GlassCard className="p-4 habits-chart">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary">Weekly Progress</h3>
          <span className="text-[10px] text-muted">{data.reduce((s, d) => s + d.completed, 0)}/{data.reduce((s, d) => s + d.total, 0)}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: '150px' }}>
          <defs>
            <linearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartAccent} stopOpacity="0.35" />
              <stop offset="100%" stopColor={chartAccent} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          <motion.path d={waveArea} fill="url(#waveGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} />
          <motion.path d={wavePath} fill="none" stroke={chartAccent} strokeWidth="2" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: 'easeInOut' }} />
          {points.map((p, i) => (
            <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.7 + i * 0.05, type: 'spring' }}>
              <circle cx={p.x} cy={p.y} r="3.5" fill={p.isToday ? chartAccent : 'var(--bg-card)'} stroke={chartAccent} strokeWidth="1.5" />
              <text x={p.x} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{p.day}</text>
            </motion.g>
          ))}
        </svg>
      </GlassCard>
    )
  }

  /* ── NEON variant ── */
  if (chartStyle === 'neon') {
    return (
      <GlassCard className="p-4 habits-chart overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary">Weekly Progress</h3>
          <span className="text-[10px] text-muted">{data.reduce((s, d) => s + d.completed, 0)}/{data.reduce((s, d) => s + d.total, 0)}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: '150px' }}>
          <defs>
            <filter id="neonGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <linearGradient id="neonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartAccent} stopOpacity="0.2" />
              <stop offset="100%" stopColor={chartAccent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0.25, 0.5, 0.75, 1].map((f, i) => (
            <line key={i} x1={PAD.left} y1={PAD.top + chartH * (1 - f)} x2={W - PAD.right} y2={PAD.top + chartH * (1 - f)}
              stroke={chartGrid} strokeWidth="0.5" strokeDasharray="2,4" />
          ))}
          <motion.path d={areaPath} fill="url(#neonGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
          <motion.path d={linePath} fill="none" stroke={chartAccent} strokeWidth="2.5" strokeLinecap="round" filter="url(#neonGlow)"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
          {points.map((p, i) => (
            <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.06, type: 'spring', stiffness: 300, damping: 15 }}>
              <circle cx={p.x} cy={p.y} r="5" fill={chartAccent} opacity="0.2" filter="url(#neonGlow)" />
              <circle cx={p.x} cy={p.y} r="3" fill={p.isToday ? '#fff' : chartAccent} stroke={chartAccent} strokeWidth="1.5" />
              {p.isToday && <circle cx={p.x} cy={p.y} r="7" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />}
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fill="var(--text-secondary)">{p.completed}</text>
              <text x={p.x} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{p.day}</text>
            </motion.g>
          ))}
        </svg>
      </GlassCard>
    )
  }

  /* ── CURVED variant (Forest) ── */
  if (chartStyle === 'curved') {
    const curvedPath = points.map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const prev = points[i - 1]
      const cpx1 = (prev.x + p.x) / 2; const cpy1 = prev.y
      const cpx2 = (prev.x + p.x) / 2; const cpy2 = p.y
      return `C ${cpx1} ${cpy1} ${cpx2} ${cpy2} ${p.x} ${p.y}`
    }).join(' ')
    const curvedArea = curvedPath + ` L ${points[points.length - 1].x} ${PAD.top + chartH} L ${points[0].x} ${PAD.top + chartH} Z`
    return (
      <GlassCard className="p-4 habits-chart">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-primary">Weekly Progress</h3>
          <span className="text-[10px] text-muted">{data.reduce((s, d) => s + d.completed, 0)}/{data.reduce((s, d) => s + d.total, 0)}</span>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: '150px' }}>
          <defs>
            <linearGradient id="curvedGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartAccent} stopOpacity="0.25" />
              <stop offset="100%" stopColor={chartAccent} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <motion.path d={curvedArea} fill="url(#curvedGrad)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
          <motion.path d={curvedPath} fill="none" stroke={chartAccent} strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeInOut' }} />
          {points.map((p, i) => (
            <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.06, type: 'spring' }}>
              <circle cx={p.x} cy={p.y} r={p.isToday ? 5 : 3.5} fill={p.isToday ? chartAccent : 'var(--bg-card)'} stroke={chartAccent} strokeWidth="2" />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fill="var(--text-secondary)">{p.completed}</text>
              <text x={p.x} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{p.day}</text>
            </motion.g>
          ))}
        </svg>
      </GlassCard>
    )
  }

  /* ── LINE variant (default) ── */
  return (
    <GlassCard className="p-4 habits-chart">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-primary">Weekly Progress</h3>
        <span className="text-[10px] text-muted">{data.reduce((s, d) => s + d.completed, 0)}/{data.reduce((s, d) => s + d.total, 0)} this week</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: '150px' }}>
        <defs>
          <linearGradient id="lineArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartAccent} stopOpacity="0.25" />
            <stop offset="100%" stopColor={chartAccent} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((f, i) => (
          <line key={i} x1={PAD.left} y1={PAD.top + chartH * (1 - f)} x2={W - PAD.right} y2={PAD.top + chartH * (1 - f)} stroke={chartGrid} strokeWidth="0.5" strokeDasharray="3,3" />
        ))}
        <motion.path d={areaPath} fill="url(#lineArea)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.path d={linePath} fill="none" stroke={chartAccent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: 'easeOut' }} />
        {points.map((p, i) => (
          <motion.g key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 + i * 0.06, type: 'spring', stiffness: 300, damping: 15 }}>
            <circle cx={p.x} cy={p.y} r={p.isToday ? 5 : 3.5} fill={p.isToday ? chartAccent : 'var(--bg-card)'} stroke={chartAccent} strokeWidth="2" />
            {p.isToday && <circle cx={p.x} cy={p.y} r="9" fill="none" stroke={chartAccent} strokeWidth="1" opacity="0.3" />}
            <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="8" fill="var(--text-secondary)" fontWeight={p.isToday ? '600' : '400'}>{p.completed}</text>
            <text x={p.x} y={H - 4} textAnchor="middle" fontSize="8" fill="var(--text-muted)">{p.day}</text>
          </motion.g>
        ))}
      </svg>
    </GlassCard>
  )
}
