import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../ui/GlassCard'
import Badge from '../ui/Badge'
import { GraduationCap, ChevronRight } from 'lucide-react'
import { getSemesters, calculateCGPA } from '../../utils/gpaStorage'

export default function GpaWidget() {
  const navigate = useNavigate()
  const [semesters, setSemesters] = useState([])

  useEffect(() => {
    function refresh() { setSemesters(getSemesters()) }
    refresh()
    const interval = setInterval(refresh, 3000)
    return () => clearInterval(interval)
  }, [])

  const cgpa = useMemo(() => calculateCGPA(semesters), [semesters])

  if (semesters.length === 0) return null

  const latest = semesters[semesters.length - 1]

  return (
    <GlassCard className="p-4 cursor-pointer group" onClick={() => navigate('/grades')}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <GraduationCap size={16} className="text-[var(--accent)]" />
          GPA Overview
        </h3>
        <ChevronRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
      </div>
      <div className="flex items-end gap-4">
        <div className="text-3xl font-bold text-[var(--accent)]">{cgpa}</div>
        <div className="text-xs text-muted pb-1">CGPA · {semesters.length} semesters</div>
      </div>
      {latest && (
        <div className="mt-2 text-xs text-muted">
          Latest: {latest.name}
        </div>
      )}
    </GlassCard>
  )
}
