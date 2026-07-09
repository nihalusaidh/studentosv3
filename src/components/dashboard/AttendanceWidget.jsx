import { useState, useEffect } from 'react'
import { getSubjects, calculateAttendance, getRecovery, getSkipCount } from '../../utils/attendanceStorage'
import GlassCard from '../ui/GlassCard'
import Badge from '../ui/Badge'
import { CalendarCheck, AlertTriangle, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function AttendanceWidget() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    setSubjects(getSubjects())
    const interval = setInterval(() => setSubjects(getSubjects()), 2000)
    return () => clearInterval(interval)
  }, [])

  let totalPresent = 0
  let totalConducted = 0
  let atRisk = 0
  let pendingToday = 0

  subjects.forEach(sub => {
    const stats = calculateAttendance(sub.id)
    totalPresent += stats.presentCount
    totalConducted += stats.conductedCount
    if (stats.percentage < (sub.requiredPct || 75)) atRisk++
    pendingToday += stats.pendingToday
  })

  const pct = totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 100) : 0
  const safe = pct >= 75

  return (
    <GlassCard className="p-4 cursor-pointer" onClick={() => navigate('/attendance')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${safe ? 'bg-[var(--success)]/20' : 'bg-[var(--danger)]/20'}`}>
            <CalendarCheck size={20} className={safe ? 'text-[var(--success)]' : 'text-[var(--danger)]'} />
          </div>
          <div>
            <p className="text-xs text-muted">Attendance</p>
            <p className="text-lg font-bold text-primary">{pct}%</p>
          </div>
        </div>
        {atRisk > 0 && <Badge variant="danger">{atRisk} at risk</Badge>}
      </div>
      <div className="flex items-center justify-between text-xs text-secondary">
        <span>{subjects.length} subjects</span>
        {pendingToday > 0 && (
          <span className="text-[var(--warning)] flex items-center gap-1">
            <TrendingUp size={12} />
            {pendingToday} pending today
          </span>
        )}
      </div>
    </GlassCard>
  )
}
