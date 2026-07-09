import React, { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, parseISO, startOfWeek, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, MinusCircle, Ban, AlertTriangle } from 'lucide-react'
import { markAttendance, getSessions, getSubject } from '../../utils/attendanceStorage'

export default function AttendanceCalendar({ subjectId, onClose }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const subject = getSubject(subjectId)
  const sessions = useMemo(() => getSessions(subjectId), [subjectId])
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const days = eachDayOfInterval({ start: calStart, end: addDays(calStart, 41) })

  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

  const handleMark = (sessionId, status) => {
    if (!sessionId) return
    const result = markAttendance(sessionId, status)
    if (result?.error) {
      showToast(result.error)
    }
  }

  const getDaySessions = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return sessions.filter(s => s.date === dateStr)
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
      <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{subject.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">{subject.semester} — {subject.faculty}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500">
              <ChevronRight size={20} className="rotate-180" />
            </button>
          </div>
        </div>

        {toast && (
          <div className="mx-5 mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 flex items-center gap-2 text-xs text-red-600 dark:text-red-400">
            <AlertTriangle size={14} />
            {toast}
          </div>
        )}

        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
            <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-px mb-1">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-px">
            {days.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, currentMonth)
              const isToday = isSameDay(day, new Date())
              const daySessions = getDaySessions(day)
              const dateStr = format(day, 'yyyy-MM-dd')

              const sessionStatuses = daySessions.map(s => s.status)
              const hasPresent = sessionStatuses.includes('present')
              const hasAbsent = sessionStatuses.includes('absent')
              const hasUnmarked = sessionStatuses.includes('unmarked')
              const hasHoliday = sessionStatuses.includes('holiday')

              let dayIndicator = 'empty'
              if (daySessions.length > 0) {
                if (hasUnmarked && !hasPresent && !hasAbsent) dayIndicator = 'unmarked'
                else if (hasHoliday && !hasPresent && !hasAbsent) dayIndicator = 'holiday'
                else if (hasPresent && !hasAbsent) dayIndicator = 'present'
                else if (hasAbsent && !hasPresent) dayIndicator = 'absent'
                else dayIndicator = 'mixed'
              }

              return (
                <div key={idx} className={`min-h-[60px] p-1 rounded-lg border ${isCurrentMonth ? 'border-gray-100 dark:border-gray-700' : 'border-transparent'} ${isToday ? 'ring-2 ring-purple-400' : ''} ${!isCurrentMonth ? 'opacity-40' : ''}`}>
                  <p className={`text-xs font-medium mb-1 ${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                    {format(day, 'd')}
                  </p>
                  <div className="space-y-0.5">
                    {daySessions.map(session => {
                      const isPast = dateStr <= format(new Date(), 'yyyy-MM-dd')
                      const isLocked = session.isLocked || subject.semesterCompleted
                      const isFuture = dateStr > format(new Date(), 'yyyy-MM-dd')

                      return (
                        <div key={session.id} className={`text-[10px] leading-tight px-1 py-0.5 rounded ${session.status === 'present' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : session.status === 'absent' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : session.status === 'holiday' ? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 line-through' : isFuture ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 dark:text-blue-400' : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'}`}>
                          <span className="font-medium">{session.startTime}</span>
                          {isPast && !isLocked && !isFuture && session.status !== 'holiday' && (
                            <span className="flex gap-0.5 mt-0.5">
                              <button onClick={() => handleMark(session.id, 'present')} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-green-500/20 hover:bg-green-500/40 text-green-600" title="Present">
                                <CheckCircle2 size={10} />
                              </button>
                              <button onClick={() => handleMark(session.id, 'absent')} className="inline-flex items-center justify-center w-3.5 h-3.5 rounded bg-red-500/20 hover:bg-red-500/40 text-red-500" title="Absent">
                                <XCircle size={10} />
                              </button>
                            </span>
                          )}
                          {isLocked && (
                            <span className="block mt-0.5">
                              <MinusCircle size={10} />
                            </span>
                          )}
                          {isFuture && (
                            <span className="block mt-0.5">
                              <Clock size={10} />
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-green-500" /> Present</span>
          <span className="flex items-center gap-1"><XCircle size={12} className="text-red-500" /> Absent</span>
          <span className="flex items-center gap-1"><Clock size={12} className="text-yellow-500" /> Unmarked</span>
          <span className="flex items-center gap-1"><Ban size={12} className="text-gray-400" /> Holiday</span>
        </div>
      </div>
    </div>
  )
}
