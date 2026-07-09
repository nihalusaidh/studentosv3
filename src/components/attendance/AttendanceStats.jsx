import { calculateAttendance, getRecovery, getSkipCount } from '../../utils/attendanceStorage'
import GlassCard from '../ui/GlassCard'
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Calendar, Clock } from 'lucide-react'

export default function AttendanceStats({ subjects }) {
  let totalPresent = 0
  let totalConducted = 0
  let totalScheduled = 0
  let atRiskCount = 0
  let safeCount = 0
  let worstSubject = null
  let worstPct = 100

  subjects.forEach(sub => {
    const stats = calculateAttendance(sub.id)
    totalPresent += stats.presentCount
    totalConducted += stats.conductedCount
    totalScheduled += stats.totalScheduled

    if (stats.percentage < (sub.requiredPct || 75)) atRiskCount++
    else safeCount++

    if (stats.percentage < worstPct && stats.conductedCount > 0) {
      worstPct = stats.percentage
      worstSubject = sub
    }
  })

  const overallPct = totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 100) : 0

  const size = 120
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (overallPct / 100) * circumference

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <GlassCard className="p-4 flex flex-col items-center justify-center">
        <svg width={size} height={size} className="-rotate-90 mb-2">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border-color)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={overallPct >= 75 ? 'var(--success)' : overallPct >= 70 ? 'var(--warning)' : 'var(--danger)'}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700"
          />
        </svg>
        <p className="text-2xl font-bold text-primary">{overallPct}%</p>
        <p className="text-xs text-muted">Overall Attendance</p>
      </GlassCard>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <GlassCard className="p-3 text-center">
            <CheckCircle size={18} className="text-[var(--success)] mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{safeCount}</p>
            <p className="text-[10px] text-muted">Safe</p>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <AlertTriangle size={18} className="text-[var(--danger)] mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{atRiskCount}</p>
            <p className="text-[10px] text-muted">At Risk</p>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <Calendar size={18} className="text-[var(--info)] mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{totalScheduled}</p>
            <p className="text-[10px] text-muted">Scheduled</p>
          </GlassCard>
          <GlassCard className="p-3 text-center">
            <Clock size={18} className="text-[var(--accent)] mx-auto mb-1" />
            <p className="text-lg font-bold text-primary">{totalConducted}</p>
            <p className="text-[10px] text-muted">Conducted</p>
          </GlassCard>
        </div>

        {worstSubject && (
          <GlassCard className="p-3 flex items-center gap-2">
            <TrendingDown size={16} className="text-[var(--danger)]" />
            <p className="text-xs text-secondary">
              Lowest: <span className="font-medium text-primary">{worstSubject.name}</span> ({worstPct}%)
            </p>
          </GlassCard>
        )}
      </div>
    </div>
  )
}
