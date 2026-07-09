import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import GlassCard from '../ui/GlassCard'
import Badge from '../ui/Badge'
import { Calendar, AlertTriangle, ChevronRight } from 'lucide-react'
import { getNextExam, getExamCountdown } from '../../utils/examStorage'

export default function ExamCountdown() {
  const navigate = useNavigate()
  const [nextExam, setNextExam] = useState(null)
  const [countdown, setCountdown] = useState(null)

  useEffect(() => {
    function refresh() {
      const exam = getNextExam()
      setNextExam(exam)
      setCountdown(exam ? getExamCountdown(exam) : null)
    }
    refresh()
    const interval = setInterval(refresh, 30000)
    return () => clearInterval(interval)
  }, [])

  if (!nextExam || !countdown) return null

  return (
    <GlassCard className="p-4 relative overflow-hidden cursor-pointer group" onClick={() => navigate('/exams')}>
      <div className="absolute top-0 right-0 w-24 h-24 opacity-[0.03]">
        <AlertTriangle size={96} className={countdown.urgent ? 'text-red-500' : 'text-amber-500'} />
      </div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
          <Calendar size={16} className="text-[var(--accent)]" />
          Next Exam
        </h3>
        <ChevronRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
      </div>
      <p className="text-sm font-medium text-primary truncate">{nextExam.title}</p>
      {nextExam.subjectName && <p className="text-xs text-muted">{nextExam.subjectName}</p>}
      <div className="mt-3 flex items-end justify-between">
        <div className={`text-3xl font-bold ${countdown.urgent ? 'text-red-500 animate-pulse' : 'text-[var(--accent)]'}`}>
          {countdown.days}
        </div>
        <Badge variant={countdown.urgent ? 'danger' : 'default'}>{countdown.label}</Badge>
      </div>
    </GlassCard>
  )
}
