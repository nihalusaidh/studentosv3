import React, { useState, useMemo } from 'react'
import { X, Percent, Clock, CalendarDays, AlertTriangle, CheckCircle2, TrendingDown, Zap } from 'lucide-react'
import { getSubjects, getAllSessions, calculateAttendance } from '../../utils/attendanceStorage'
import { format, parseISO } from 'date-fns'

function parseHour(time) {
  return parseInt(time.split(':')[0], 10)
}

function getDayIndex(weekday) {
  const map = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 }
  return map[weekday.toLowerCase()] ?? 0
}

function scoreSession(session, subjectStats) {
  const hour = parseHour(session.startTime)
  const dayIdx = getDayIndex(session.weekday)
  const pct = subjectStats[session.subjectId]?.percentage || 0

  const timeScore = Math.max(0, (hour - 8)) * 8
  const dayScore = dayIdx * 4
  const attScore = pct * 0.4
  const total = timeScore + dayScore + attScore

  return { total, timeScore, dayScore, attScore }
}

export default function AttendanceSimulator({ onClose }) {
  const subjects = useMemo(() => getSubjects().filter(s => !s.semesterCompleted), [])
  const allSessions = useMemo(() => getAllSessions(), [])
  const [mode, setMode] = useState('all')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [skipCount, setSkipCount] = useState(3)
  const [results, setResults] = useState(null)

  const today = format(new Date(), 'yyyy-MM-dd')

  const subjectStats = useMemo(() => {
    const stats = {}
    subjects.forEach(sub => {
      stats[sub.id] = calculateAttendance(sub.id)
    })
    return stats
  }, [subjects])

  const upcomingSessions = useMemo(() => {
    let sessions = allSessions.filter(s => {
      const sub = subjects.find(x => x.id === s.subjectId)
      if (!sub) return false
      if (mode === 'single' && s.subjectId !== selectedSubject) return false
      return s.date > today
    })
    return sessions
  }, [allSessions, subjects, mode, selectedSubject, today])

  const scoredSessions = useMemo(() => {
    return upcomingSessions.map(s => {
      const score = scoreSession(s, subjectStats)
      const sub = subjects.find(x => x.id === s.subjectId)
      return { ...s, score, subjectName: sub?.name || 'Unknown', subjectColor: sub?.color || '#a855f7', subjectPct: subjectStats[s.subjectId]?.percentage || 0 }
    })
  }, [upcomingSessions, subjectStats, subjects])

  const handleSimulate = () => {
    if (scoredSessions.length === 0) return
    const sorted = [...scoredSessions].sort((a, b) => b.score.total - a.score.total)
    const top = sorted.slice(0, skipCount)

    const affected = {}
    const origStats = {}
    const newStats = {}

    subjects.forEach(sub => {
      origStats[sub.id] = { ...subjectStats[sub.id] }
      affected[sub.id] = { skipped: 0 }
    })

    top.forEach(s => {
      if (affected[s.subjectId]) {
        affected[s.subjectId].skipped++
      }
    })

    Object.keys(affected).forEach(id => {
      const stats = origStats[id]
      if (!stats || !affected[id].skipped) return
      const newConducted = stats.conductedCount + affected[id].skipped
      const newPct = newConducted > 0 ? Math.round((stats.presentCount / newConducted) * 100) : 0
      newStats[id] = {
        name: subjects.find(s => s.id === id)?.name || 'Unknown',
        color: subjects.find(s => s.id === id)?.color || '#a855f7',
        oldPct: stats.percentage,
        newPct,
        skipped: affected[id].skipped
      }
    })

    setResults({ recommendations: top, affected: newStats })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose() }}>
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Zap size={20} className="text-yellow-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Simulator</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 shrink-0 space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                <option value="all">All Subjects</option>
                <option value="single">Specific Subject</option>
              </select>
            </div>
            {mode === 'single' && (
              <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none">
                  <option value="">Select...</option>
                  {subjects.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                </select>
              </div>
            )}
            <div className="w-28">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Skip Count</label>
              <input type="number" min={1} max={50} value={skipCount} onChange={e => setSkipCount(Math.max(1, parseInt(e.target.value) || 1))} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
            </div>
            <div className="flex items-end">
              <button onClick={handleSimulate} disabled={scoredSessions.length === 0 || (mode === 'single' && !selectedSubject)} className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed">
                Simulate
              </button>
            </div>
          </div>

          {scoredSessions.length > 0 && (
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                <CalendarDays size={12} className="inline mr-1" />
                {scoredSessions.length} upcoming class{scoredSessions.length !== 1 ? 'es' : ''} available
              </p>
            </div>
          )}
        </div>

        {results && (
          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                <TrendingDown size={16} className="text-orange-500" />
                Recommended to Skip (by {results.recommendations.length})
              </h3>
              <div className="space-y-1">
                {results.recommendations.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs">
                    <span className="text-gray-400 w-5 shrink-0">#{idx + 1}</span>
                    <span className="font-medium text-gray-900 dark:text-white w-28 shrink-0">{format(parseISO(s.date), 'MMM dd')} {s.startTime}</span>
                    <span className="text-gray-500 dark:text-gray-400 w-14 shrink-0">{s.weekday?.slice(0, 3)}</span>
                    <span className="font-medium shrink-0" style={{ color: s.subjectColor }}>{s.subjectName}</span>
                    <div className="flex items-center gap-1 ml-auto text-gray-400">
                      <span className="flex items-center gap-0.5" title="Time score"><Clock size={10} /> {Math.round(s.score.timeScore)}</span>
                      <span className="flex items-center gap-0.5" title="Day score"><CalendarDays size={10} /> {Math.round(s.score.dayScore)}</span>
                      <span className="flex items-center gap-0.5" title="Attendance score"><Percent size={10} /> {Math.round(s.score.attScore)}</span>
                      <span className="font-bold text-gray-700 dark:text-gray-300 ml-1">Score: {Math.round(s.score.total)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                <Percent size={16} className="text-purple-500" />
                Impact on Attendance
              </h3>
              <div className="space-y-1">
                {Object.values(results.affected).filter(a => a.skipped > 0).map(a => (
                  <div key={a.name} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-xs">
                    <span className="font-medium text-gray-900 dark:text-white shrink-0" style={{ color: a.color }}>{a.name}</span>
                    <span className="text-gray-500 shrink-0">Skip {a.skipped}</span>
                    <span className={`font-semibold ${a.newPct >= (subjects.find(s => s.name === a.name)?.requiredPct || 75) ? 'text-green-600' : 'text-orange-500'}`}>
                      {a.oldPct}% → {a.newPct}%
                    </span>
                    {a.newPct < (subjects.find(s => s.name === a.name)?.requiredPct || 75) && (
                      <AlertTriangle size={12} className="text-orange-500 shrink-0" />
                    )}
                    {a.newPct >= (subjects.find(s => s.name === a.name)?.requiredPct || 75) && (
                      <CheckCircle2 size={12} className="text-green-500 shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs text-gray-600 dark:text-gray-400">
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">How scoring works</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong>Time score:</strong> Later classes score higher (easier to skip)</li>
                <li><strong>Day score:</strong> End-of-week classes score higher</li>
                <li><strong>Attendance score:</strong> Subjects with high attendance are safer to skip</li>
              </ul>
            </div>
          </div>
        )}

        {results === null && (
          <div className="flex-1 flex items-center justify-center p-10">
            <div className="text-center">
              <Zap size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Set the mode and skip count, then click Simulate</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">The simulator will recommend the best classes to skip based on timing and attendance</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
