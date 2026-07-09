import React, { useState, useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { X, CheckCircle2, XCircle, Ban, Clock, AlertTriangle, Trash2, ChevronDown, ChevronUp, CalendarDays, Percent } from 'lucide-react'
import { getSubject, getSessions, markAttendance, markHoliday, removeHoliday } from '../../utils/attendanceStorage'

export default function SubjectDetail({ subjectId, onClose }) {
  const [refreshKey, setRefreshKey] = useState(0)
  const subject = getSubject(subjectId)
  const allSessions = useMemo(() => getSessions(subjectId), [subjectId, refreshKey])
  const [toast, setToast] = useState(null)
  const [holidayRange, setHolidayRange] = useState({ start: '', end: '', reason: '' })
  const [showHolidayForm, setShowHolidayForm] = useState(false)
  const [sortDir, setSortDir] = useState('asc')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  const stats = useMemo(() => {
    const conducted = allSessions.filter(s => (s.status === 'present' || s.status === 'absent') && s.date <= today)
    const present = allSessions.filter(s => s.status === 'present' && s.date <= today)
    const absent = allSessions.filter(s => s.status === 'absent' && s.date <= today)
    const holidays = allSessions.filter(s => s.status === 'holiday')
    const upcoming = allSessions.filter(s => s.date > today)
    const unmarked = allSessions.filter(s => s.status === 'unmarked' && s.date <= today && !s.isLocked)
    return {
      total: allSessions.length,
      conducted: conducted.length,
      present: present.length,
      absent: absent.length,
      holidays: holidays.length,
      upcoming: upcoming.length,
      unmarked: unmarked.length,
      percentage: conducted.length > 0 ? Math.round((present.length / conducted.length) * 100) : 0
    }
  }, [allSessions, today])

  const sortedSessions = useMemo(() => {
    return [...allSessions].sort((a, b) => {
      const cmp = a.date.localeCompare(b.date)
      if (cmp !== 0) return sortDir === 'asc' ? cmp : -cmp
      return sortDir === 'asc' ? a.startTime.localeCompare(b.startTime) : b.startTime.localeCompare(a.startTime)
    })
  }, [allSessions, sortDir, today])

  const handleMark = (sessionId, status) => {
    const result = markAttendance(sessionId, status)
    if (result?.error) showToast(result.error, 'error')
    else { showToast(`Marked as ${status}`); setRefreshKey(k => k + 1) }
  }

  const handleMarkHoliday = (sessionId) => {
    const reason = prompt('Reason for holiday:')
    if (!reason) return
    markHoliday([sessionId], reason)
    setRefreshKey(k => k + 1)
    showToast('Marked as holiday')
  }

  const handleRemoveHoliday = (sessionId) => {
    removeHoliday(sessionId)
    setRefreshKey(k => k + 1)
    showToast('Holiday removed')
  }

  const handleBulkHoliday = () => {
    if (!holidayRange.start || !holidayRange.end || !holidayRange.reason) {
      showToast('Fill all fields', 'error')
      return
    }
    const start = holidayRange.start
    const end = holidayRange.end
    const ids = allSessions
      .filter(s => s.date >= start && s.date <= end)
      .map(s => s.id)
    if (ids.length === 0) {
      showToast('No classes in that range', 'error')
      return
    }
    markHoliday(ids, holidayRange.reason)
    setRefreshKey(k => k + 1)
    showToast(`${ids.length} classes marked as holiday`)
    setShowHolidayForm(false)
    setHolidayRange({ start: '', end: '', reason: '' })
  }

  if (!subject) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose() }}>
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-2xl max-w-lg w-full text-center">
          <p className="text-gray-500 dark:text-gray-400">Subject not found.</p>
          <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm">Close</button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget && onClose) onClose() }}>
      <div className="w-full max-w-4xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: subject.color || '#a855f7' }}>
              {subject.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{subject.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{subject.semester} — {subject.faculty}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
            <X size={20} />
          </button>
        </div>

        {toast && (
          <div className={`mx-5 mt-3 px-3 py-2 rounded-lg flex items-center gap-2 text-xs ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 text-green-600 dark:text-green-400'}`}>
            {toast.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            {toast.msg}
          </div>
        )}

        <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3 shrink-0">
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Scheduled</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-green-600 dark:text-green-400">{stats.present}</p>
            <p className="text-xs text-gray-500">Present</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold text-red-500">{stats.absent}</p>
            <p className="text-xs text-gray-500">Absent</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-center">
            <p className="text-xl font-bold" style={{ color: subject.color || '#a855f7' }}>{stats.percentage}%</p>
            <p className="text-xs text-gray-500">Attendance</p>
          </div>
        </div>

        <div className="px-5 pb-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Classes</h3>
            <span className="text-xs text-gray-400">({allSessions.length} sessions)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHolidayForm(!showHolidayForm)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <Ban size={12} /> Mark Range Holiday
            </button>
            <button onClick={() => setSortDir(d => d === 'asc' ? 'desc' : 'asc')} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              {sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />} {sortDir === 'asc' ? 'Oldest' : 'Newest'}
            </button>
          </div>
        </div>

        {showHolidayForm && (
          <div className="mx-5 mb-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 space-y-2 shrink-0">
            <p className="text-xs font-medium text-orange-700 dark:text-orange-300">Mark date range as holiday</p>
            <div className="flex flex-wrap gap-2">
              <input type="date" value={holidayRange.start} onChange={e => setHolidayRange(p => ({ ...p, start: e.target.value }))} className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
              <input type="date" value={holidayRange.end} onChange={e => setHolidayRange(p => ({ ...p, end: e.target.value }))} className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
              <input value={holidayRange.reason} onChange={e => setHolidayRange(p => ({ ...p, reason: e.target.value }))} placeholder="Reason..." className="flex-1 min-w-[120px] px-2 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs focus:ring-2 focus:ring-purple-500 outline-none" />
              <button onClick={handleBulkHoliday} className="px-3 py-1.5 rounded-lg bg-orange-500 text-white text-xs font-medium hover:bg-orange-600 transition-colors">Apply</button>
              <button onClick={() => setShowHolidayForm(false)} className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">Cancel</button>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 pb-5">
          <div className="space-y-1">
            {sortedSessions.map(session => {
              const isPast = session.date <= today
              const isFuture = session.date > today
              const isLocked = session.isLocked || subject?.semesterCompleted

              return (
                <div key={session.id} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${session.status === 'present' ? 'bg-green-50 dark:bg-green-900/10' : session.status === 'absent' ? 'bg-red-50 dark:bg-red-900/10' : session.status === 'holiday' ? 'bg-gray-100 dark:bg-gray-800' : isFuture ? 'bg-blue-50 dark:bg-blue-900/10' : 'bg-yellow-50 dark:bg-yellow-900/10'} border border-gray-100 dark:border-gray-700`}>
                  <span className="font-medium text-gray-900 dark:text-white w-24 shrink-0">{format(parseISO(session.date), 'MMM dd, yyyy')}</span>
                  <span className="text-gray-500 dark:text-gray-400 w-16 shrink-0">{session.weekday.slice(0, 3)}</span>
                  <span className="text-gray-500 dark:text-gray-400 w-20 shrink-0">{session.startTime} - {session.endTime}</span>

                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium w-20 shrink-0 ${session.status === 'present' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : session.status === 'absent' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : session.status === 'holiday' ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 line-through' : isFuture ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'}`}>
                    {session.status === 'present' && <><CheckCircle2 size={10} /> Present</>}
                    {session.status === 'absent' && <><XCircle size={10} /> Absent</>}
                    {session.status === 'holiday' && <><Ban size={10} /> {session.holidayReason || 'Holiday'}</>}
                    {session.status === 'unmarked' && isFuture && <><Clock size={10} /> Upcoming</>}
                    {session.status === 'unmarked' && !isFuture && !isLocked && <><Clock size={10} /> Unmarked</>}
                  </span>

                      {isLocked && (
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 ml-auto">
                          <Ban size={10} /> Locked
                        </span>
                      )}
                      {!isLocked && session.status === 'holiday' && (
                        <button onClick={() => handleRemoveHoliday(session.id)} className="ml-auto p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors" title="Remove Holiday">
                          <Trash2 size={12} />
                        </button>
                      )}
                      {!isLocked && session.status !== 'holiday' && (
                        <div className="flex items-center gap-1 ml-auto">
                          {(isPast || (isFuture && session.status === 'unmarked')) && (
                            <>
                              <button onClick={() => handleMark(session.id, 'present')} className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-500 transition-colors" title="Present">
                                <CheckCircle2 size={14} />
                              </button>
                              <button onClick={() => handleMark(session.id, 'absent')} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 transition-colors" title="Absent">
                                <XCircle size={14} />
                              </button>
                            </>
                          )}
                          {(isFuture || isPast) && (
                            <button onClick={() => handleMarkHoliday(session.id)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors" title="Mark Holiday">
                              <Ban size={14} />
                            </button>
                          )}
                        </div>
                      )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
