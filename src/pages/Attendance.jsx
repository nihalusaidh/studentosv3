import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Plus, CheckCircle2, Beaker, AlertTriangle, Percent, CalendarDays, XCircle, TrendingDown, Zap, BarChart3 } from 'lucide-react'
import { getSubjects, deleteSubject, calculateAttendance, getRecovery, getSkipCount, completeSemester, getAllSessions } from '../utils/attendanceStorage'
import SubjectCard from '../components/attendance/SubjectCard'
import SubjectForm from '../components/attendance/SubjectForm'
import SubjectDetail from '../components/attendance/SubjectDetail'
import UnifiedCalendar from '../components/attendance/UnifiedCalendar'
import AttendanceSimulator from '../components/attendance/AttendanceSimulator'
import { format } from 'date-fns'

export default function Attendance() {
  const [subjects, setSubjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editSubjectId, setEditSubjectId] = useState(null)
  const [detailSubjectId, setDetailSubjectId] = useState(null)
  const [showSimulator, setShowSimulator] = useState(false)
  const [subjectStats, setSubjectStats] = useState({})
  const [recovery, setRecovery] = useState({})
  const [skips, setSkips] = useState({})
  const [confirmComplete, setConfirmComplete] = useState(null)
  const [toast, setToast] = useState(null)
  const [showUnifiedCalendar, setShowUnifiedCalendar] = useState(false)

  const refresh = useCallback(() => {
    const subs = getSubjects().filter(s => !s.semesterCompleted)
    setSubjects(subs)
    const stats = {}
    const rec = {}
    const sk = {}
    subs.forEach(sub => {
      stats[sub.id] = calculateAttendance(sub.id)
      rec[sub.id] = getRecovery(sub.id, sub.requiredPct || 75)
      sk[sub.id] = getSkipCount(sub.id, sub.requiredPct || 75)
    })
    setSubjectStats(stats)
    setRecovery(rec)
    setSkips(sk)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const allSessions = useMemo(() => getAllSessions(), [subjectStats])

  const overallStats = useMemo(() => {
    const activeSubjects = subjects
    if (activeSubjects.length === 0) return null
    let totalPresent = 0, totalAbsent = 0, totalConducted = 0, totalUpcoming = 0, totalScheduled = 0
    let best = { name: '', pct: 0, color: '' }
    let worst = { name: '', pct: 100, color: '' }
    let pendingToday = 0

    activeSubjects.forEach(sub => {
      const stats = subjectStats[sub.id]
      if (!stats) return
      totalPresent += stats.presentCount
      totalAbsent += stats.absentCount
      totalConducted += stats.conductedCount
      totalUpcoming += stats.upcomingCount
      totalScheduled += stats.totalScheduled
      pendingToday += stats.pendingToday
      if (stats.conductedCount > 0) {
        if (stats.percentage > best.pct) best = { name: sub.name, pct: stats.percentage, color: sub.color }
        if (stats.percentage < worst.pct) worst = { name: sub.name, pct: stats.percentage, color: sub.color }
      }
    })

    const overallPct = totalConducted > 0 ? Math.round((totalPresent / totalConducted) * 100) : 0

    return { totalPresent, totalAbsent, totalConducted, totalUpcoming, totalScheduled, overallPct, pendingToday, best, worst, subjectCount: activeSubjects.length }
  }, [subjects, subjectStats])

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const handleDelete = (id) => {
    if (window.confirm('Delete this subject and all its attendance data?')) {
      deleteSubject(id)
      refresh()
    }
  }

  const handleEdit = (id) => {
    setEditSubjectId(id)
    setShowForm(true)
  }

  const handleComplete = (id) => {
    setConfirmComplete(id)
  }

  const confirmCompleteSemester = () => {
    if (!confirmComplete) return
    const sub = getSubjects().find(s => s.id === confirmComplete)
    const result = completeSemester(confirmComplete)
    if (result) {
      showToast(`"${sub?.name}" semester completed!`)
    }
    setConfirmComplete(null)
    refresh()
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditSubjectId(null)
    refresh()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pb-20">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track your class attendance</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSimulator(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-400 text-sm font-medium hover:bg-yellow-200 dark:hover:bg-yellow-900/60 transition-all border border-yellow-200 dark:border-yellow-700">
              <Zap size={16} />
              Simulator
            </button>
            <button onClick={() => { setEditSubjectId(null); setShowForm(true) }} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25">
              <Plus size={18} />
              Add Subject
            </button>
          </div>
        </div>

        {toast && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <CheckCircle2 size={16} />
            {toast}
          </div>
        )}

        {overallStats && subjects.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{overallStats.subjectCount}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Subjects</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-bold text-gray-900 dark:text-white">{overallStats.totalConducted}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Conducted</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-bold text-green-600 dark:text-green-400">{overallStats.totalPresent}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Present</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-bold text-red-500">{overallStats.totalAbsent}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Absent</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{overallStats.overallPct}%</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Overall %</p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                <p className="text-lg font-bold text-yellow-500">{overallStats.pendingToday}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">Pending Today</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-4">
              {overallStats.best.name && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-xs text-green-700 dark:text-green-300">
                  <BarChart3 size={14} />
                  Best: <span className="font-semibold" style={{ color: overallStats.best.color }}>{overallStats.best.name}</span> ({overallStats.best.pct}%)
                </div>
              )}
              {overallStats.worst.name && overallStats.worst.pct < 100 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-xs text-red-700 dark:text-red-300">
                  <AlertTriangle size={14} />
                  Needs focus: <span className="font-semibold" style={{ color: overallStats.worst.color }}>{overallStats.worst.name}</span> ({overallStats.worst.pct}%)
                </div>
              )}
              {overallStats.totalUpcoming > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 text-xs text-blue-700 dark:text-blue-300">
                  <CalendarDays size={14} />
                  {overallStats.totalUpcoming} upcoming classes
                </div>
              )}
              <button onClick={() => setShowUnifiedCalendar(!showUnifiedCalendar)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                <CalendarDays size={14} />
                {showUnifiedCalendar ? 'Hide Calendar' : 'Show Calendar'}
              </button>
            </div>

            {showUnifiedCalendar && <div className="mb-4"><UnifiedCalendar /></div>}
          </>
        )}

        {subjects.length === 0 ? (
          <div className="text-center py-20">
            <Beaker size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-500 dark:text-gray-400 mb-2">No subjects yet</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">Add your first subject to start tracking attendance</p>
            <button onClick={() => { setEditSubjectId(null); setShowForm(true) }} className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25 inline-flex items-center gap-2">
              <Plus size={16} />
              Add Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjects.map(sub => (
              <SubjectCard
                key={sub.id}
                subject={sub}
                stats={subjectStats[sub.id]}
                recovery={recovery[sub.id]}
                skip={skips[sub.id]}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onComplete={handleComplete}
                onViewDetail={setDetailSubjectId}
              />
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <SubjectForm
          editSubjectId={editSubjectId}
          onClose={handleFormClose}
        />
      )}

      {detailSubjectId && (
        <SubjectDetail
          subjectId={detailSubjectId}
          onClose={() => { setDetailSubjectId(null); refresh() }}
        />
      )}

      {showSimulator && (
        <AttendanceSimulator onClose={() => setShowSimulator(false)} />
      )}

      {confirmComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) setConfirmComplete(null) }}>
          <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle size={24} className="text-orange-500" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Complete Semester?</h3>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              This will freeze all attendance data for this subject and save a snapshot to your history. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmComplete(null)} className="flex-1 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
              <button onClick={confirmCompleteSemester} className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25">
                Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
