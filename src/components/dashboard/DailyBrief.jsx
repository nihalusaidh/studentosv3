import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RefreshCw, Calendar, BookOpen, CheckSquare, TrendingUp, AlertTriangle } from 'lucide-react'
import { format, parseISO, differenceInDays, isBefore, isToday, isTomorrow } from 'date-fns'
import { callGemini } from '../../config/gemini'
import { useAuth } from '../../contexts/AuthContext'
import { getExams } from '../../utils/examStorage'
import { getData as getAttendance } from '../../utils/attendanceStorage'
import { getTasks } from '../../utils/tasksStorage'
import { getHabits } from '../../utils/habitStorage'
import { getSubjects as getMarksSubjects } from '../../utils/marksStorage'

const BRIEF_KEY = 'student-os-daily-brief'
const DAY_KEY = 'student-os-daily-brief-date'

function getCachedBrief() {
  try {
    const date = localStorage.getItem(DAY_KEY)
    const today = format(new Date(), 'yyyy-MM-dd')
    if (date !== today) return null
    const raw = localStorage.getItem(BRIEF_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function setCachedBrief(data) {
  try {
    localStorage.setItem(DAY_KEY, format(new Date(), 'yyyy-MM-dd'))
    localStorage.setItem(BRIEF_KEY, JSON.stringify(data))
  } catch {}
}

function generateFallbackBrief() {
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const priority = []
  const focus = []
  let tip = ''

  const exams = getExams().filter(e => !isBefore(parseISO(e.examDate), today))
    .sort((a, b) => a.examDate.localeCompare(b.examDate))

  const upcomingExams = exams.filter(e => differenceInDays(parseISO(e.examDate), today) <= 14)
  upcomingExams.forEach(e => {
    const d = differenceInDays(parseISO(e.examDate), today)
    let label = d === 0 ? 'Today!' : d === 1 ? 'Tomorrow!' : `in ${d} days`
    priority.push({ emoji: '📝', text: `${e.title} ${label}` })
  })

  const attendance = getAttendance()
  attendance.subjects.forEach(s => {
    const total = s.totalScheduled || 0
    const present = s.presentCount || 0
    if (total > 0) {
      const pct = Math.round((present / total) * 100)
      const required = s.requiredPct || 75
      if (pct < required) {
        focus.push({ emoji: '📖', text: `${s.name} — ${pct}% attendance (needs ${required}%)` })
      }
    }
  })

  const tasks = getTasks().filter(t => t.status !== 'completed' && t.dueDate)
  const dueSoon = tasks.filter(t => {
    const dd = parseISO(t.dueDate)
    return isToday(dd) || isTomorrow(dd) || (differenceInDays(dd, today) <= 3 && differenceInDays(dd, today) >= 0)
  })
  dueSoon.forEach(t => {
    let label = isToday(parseISO(t.dueDate)) ? 'Due today' : isTomorrow(parseISO(t.dueDate)) ? 'Due tomorrow' : `Due ${format(parseISO(t.dueDate), 'MMM d')}`
    priority.push({ emoji: '✅', text: `${t.title} — ${label}` })
  })

  const habits = getHabits()
  const pendingHabits = habits.filter(h => !h.completedDates?.[todayStr] && !h.isArchived)
  if (pendingHabits.length > 0) {
    focus.push({ emoji: '🎯', text: `${pendingHabits.length} habit${pendingHabits.length > 1 ? 's' : ''} pending today` })
  }

  const marks = getMarksSubjects()
  const upcomingAssessments = []
  marks.forEach(s => {
    (s.assessments || []).forEach(a => {
      if (a.status === 'upcoming') upcomingAssessments.push({ subject: s.name, name: a.name })
    })
  })
  if (upcomingAssessments.length > 0) {
    focus.push({ emoji: '📊', text: `${upcomingAssessments.length} upcoming assessment${upcomingAssessments.length > 1 ? 's' : ''}` })
  }

  if (priority.length === 0 && focus.length === 0) {
    priority.push({ emoji: '🌟', text: 'All caught up! Use this time to get ahead.' })
    tip = 'Review past material or prepare for upcoming topics.'
  } else {
    const tips = [
      'Study in focused 25-min blocks with 5-min breaks.',
      'Review material within 24 hours of learning it.',
      'Teach concepts to someone else to reinforce understanding.',
      'Stay hydrated and take short walks between study sessions.',
      'Start with your hardest subject when energy is highest.',
      'Use active recall instead of passive re-reading.',
      'Summarize each chapter in your own words after studying.'
    ]
    tip = tips[Math.floor(Math.random() * tips.length)]
  }

  return { priority, focus, tip }
}

export default function DailyBrief() {
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const { profile } = useAuth()

  const generate = useCallback(async () => {
    setGenerating(true)
    const fallback = generateFallbackBrief()
    try {

      const exams = getExams().filter(e => !isBefore(parseISO(e.examDate), new Date()))
        .sort((a, b) => a.examDate.localeCompare(b.examDate))
        .slice(0, 5)
      const attendance = getAttendance()
      const tasks = getTasks().filter(t => t.status !== 'completed' && t.dueDate)
        .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
        .slice(0, 5)
      const habits = getHabits().filter(h => !h.completedDates?.[format(new Date(), 'yyyy-MM-dd')] && !h.isArchived)
      const marks = getMarksSubjects()
      const assessments = []
      marks.forEach(s => {
        (s.assessments || []).forEach(a => {
          if (a.status === 'upcoming') assessments.push({ subject: s.name, name: a.name })
        })
      })

      const prompt = `You are a personalized academic advisor. Based on the student's data, create a concise daily study brief (max 150 words).

CRITICAL: Return ONLY valid JSON with no markdown formatting or code fences:
{
  "priority": [{"emoji": "📝", "text": "..."}],
  "focus": [{"emoji": "📖", "text": "..."}],
  "tip": "study tip here"
}

Student Data:
- Upcoming exams (next 14 days): ${JSON.stringify(exams.map(e => ({ title: e.title, date: e.examDate })))}
- Attendance: ${JSON.stringify(attendance.subjects.map(s => ({ name: s.name, present: s.presentCount || 0, total: s.totalScheduled || 0, required: s.requiredPct || 75 })))}
- Tasks due soon: ${JSON.stringify(tasks.map(t => ({ title: t.title, due: t.dueDate })))}
- Habits pending today: ${habits.length}
- Upcoming assessments: ${JSON.stringify(assessments)}`

      const res = await callGemini(prompt)

      if (res.text && !res.error) {
        try {
          const cleaned = res.text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
          const parsed = JSON.parse(cleaned)
          if (parsed.priority || parsed.focus || parsed.tip) {
            setCachedBrief(parsed)
            setBrief(parsed)
            setGenerating(false)
            return
          }
        } catch {}
      }
    } catch {}

    setCachedBrief(fallback)
    setBrief(fallback)
    setGenerating(false)
  }, [])

  useEffect(() => {
    const cached = getCachedBrief()
    if (cached) {
      setBrief(cached)
      setLoading(false)
    } else {
      setLoading(true)
      generate().finally(() => setLoading(false))
    }
  }, [generate])

  if (loading) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-400" />
          <span className="text-sm font-semibold text-primary">Daily Brief</span>
        </div>
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-3 bg-white/10 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!brief) return null

  const items = [...(brief.priority || []), ...(brief.focus || [])]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex items-center justify-between mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-purple-400" />
          <span className="text-sm font-semibold text-primary">Daily Brief</span>
          <span className="text-[10px] text-muted bg-white/5 px-1.5 py-0.5 rounded-full">{format(new Date(), 'MMM d, EEE')}</span>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="p-1.5 rounded-lg hover:bg-white/10 text-muted hover:text-primary transition-all cursor-pointer border-0 bg-transparent disabled:opacity-50"
          title="Refresh brief"
        >
          <RefreshCw size={14} className={generating ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-2 relative z-10">
        {items.length > 0 ? (
          items.slice(0, 4).map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-2.5 text-xs leading-relaxed"
            >
              <span className="shrink-0">{item.emoji}</span>
              <span className="text-secondary">{item.text}</span>
            </motion.div>
          ))
        ) : (
          <div className="flex items-start gap-2.5 text-xs leading-relaxed">
            <span className="shrink-0">🌟</span>
            <span className="text-secondary">All caught up! Enjoy your day.</span>
          </div>
        )}
      </div>

      {brief.tip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-3 pt-2.5 border-t border-white/[0.06] flex items-start gap-2 relative z-10"
        >
          <TrendingUp size={12} className="text-cyan-400 mt-0.5 shrink-0" />
          <p className="text-[11px] text-cyan-300/80 leading-relaxed">{brief.tip}</p>
        </motion.div>
      )}
    </motion.div>
  )
}
