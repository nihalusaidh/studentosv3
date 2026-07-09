import { useEffect, useState } from 'react'
import { getSubjects, calculateInternalMarks } from '../../utils/marksStorage'
import GlassCard from '../ui/GlassCard'
import Badge from '../ui/Badge'
import { BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function InternalsSummary() {
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])

  useEffect(() => {
    setSubjects(getSubjects())
    const interval = setInterval(() => setSubjects(getSubjects()), 2000)
    return () => clearInterval(interval)
  }, [])

  const stats = subjects.reduce((acc, sub) => {
    const result = calculateInternalMarks(sub.id)
    if (result) {
      acc.totalPct += result.percentage
      acc.count++
      if (result.percentage < 50) acc.atRisk++
    }
    return acc
  }, { totalPct: 0, count: 0, atRisk: 0 })

  const avg = stats.count > 0 ? Math.round(stats.totalPct / stats.count) : 0

  return (
    <GlassCard className="p-4 cursor-pointer" onClick={() => navigate('/internals')}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-[var(--info)]/20`}>
            <BarChart3 size={20} className="text-[var(--info)]" />
          </div>
          <div>
            <p className="text-xs text-muted">Internal Average</p>
            <p className="text-lg font-bold text-primary">{avg}%</p>
          </div>
        </div>
        {stats.atRisk > 0 && <Badge variant="danger">{stats.atRisk} at risk</Badge>}
      </div>
      <p className="text-xs text-secondary">{stats.count} subjects</p>
    </GlassCard>
  )
}
