import React, { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, addDays } from 'date-fns'
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Clock, Ban } from 'lucide-react'
import { getSubjects, getAllSessions, getSubject } from '../../utils/attendanceStorage'

export default function UnifiedCalendar({ onClose }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())
  const subjects = useMemo(() => getSubjects().filter(s => !s.semesterCompleted), [])
  const allSessions = useMemo(() => getAllSessions(), [])
  const subjectMap = useMemo(() => {
    const map = {}
    getSubjects().forEach(s => { map[s.id] = s })
    return map
  }, [])

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const days = eachDayOfInterval({ start: calStart, end: addDays(calStart, 41) })

  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

  const getDaySessions = (day) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    return allSessions.filter(s => s.date === dateStr)
  }

  const today = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Classes Calendar</h3>
        <div className="flex items-center gap-1">
          <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-28 text-center">{format(currentMonth, 'MMMM yyyy')}</span>
          <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="p-3">
        <div className="grid grid-cols-7 gap-px mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, new Date())
            const daySessions = getDaySessions(day)

            return (
              <div key={idx} className={`min-h-[52px] p-0.5 rounded border ${isCurrentMonth ? 'border-gray-100 dark:border-gray-700' : 'border-transparent'} ${isToday ? 'ring-2 ring-purple-400' : ''} ${!isCurrentMonth ? 'opacity-40' : ''}`}>
                <p className={`text-[10px] font-medium mb-0.5 px-0.5 ${isToday ? 'text-purple-600 dark:text-purple-400' : 'text-gray-600 dark:text-gray-400'}`}>
                  {format(day, 'd')}
                </p>
                <div className="space-y-0.5 max-h-[36px] overflow-hidden">
                  {daySessions.slice(0, 3).map(session => {
                    const sub = subjectMap[session.subjectId]
                    return (
                      <div key={session.id} className="text-[8px] leading-tight px-0.5 py-0.5 rounded truncate" style={{ backgroundColor: sub?.color ? `${sub.color}20` : '#a855f720', color: sub?.color || '#a855f7' }}>
                        {sub?.name?.slice(0, 6)} {session.startTime}
                      </div>
                    )
                  })}
                  {daySessions.length > 3 && (
                    <p className="text-[8px] text-gray-400 px-0.5">+{daySessions.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500" /> Present</span>
          <span className="flex items-center gap-1"><XCircle size={10} className="text-red-500" /> Absent</span>
          <span className="flex items-center gap-1"><Clock size={10} className="text-yellow-500" /> Unmarked</span>
          <span className="flex items-center gap-1"><Ban size={10} className="text-gray-400" /> Holiday</span>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            {subjects.slice(0, 6).map(sub => (
              <span key={sub.id} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color || '#a855f7' }} />
                <span>{sub.name}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
