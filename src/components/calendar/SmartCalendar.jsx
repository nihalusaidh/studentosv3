import React, { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, addDays, subMonths, addMonths } from 'date-fns'
import { ChevronLeft, ChevronRight, CalendarDays, Filter, X } from 'lucide-react'
import { getDayDots, getTodaySummary, getAllEventsForDate } from '../../utils/calendarStorage'

const FILTERS = [
  { key: 'all', label: 'All', color: '#fff' },
  { key: 'class', label: 'Classes', color: '#3b82f6' },
  { key: 'exam', label: 'Exams', color: '#ef4444' },
  { key: 'reminder', label: 'Reminders', color: '#f59e0b' },
  { key: 'holiday', label: 'Holidays', color: '#a855f7' },
  { key: 'custom', label: 'Events', color: '#6b7280' }
]

export default function SmartCalendar({ currentMonth, setCurrentMonth, onSelectDate, filter, setFilter }) {
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart)
  const days = eachDayOfInterval({ start: calStart, end: addDays(calStart, 41) })

  const today = new Date()

  const dayDotsMap = useMemo(() => {
    const map = {}
    days.forEach(day => {
      const dateStr = format(day, 'yyyy-MM-dd')
      const dots = getDayDots(dateStr)
      if (dots.length) map[dateStr] = dots
    })
    return map
  }, [currentMonth])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="text-sm font-semibold text-gray-900 dark:text-white hover:text-purple-600 transition-colors">
            {format(currentMonth, 'MMMM yyyy')}
          </button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium whitespace-nowrap transition-all ${filter === f.key ? 'ring-2 ring-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
              {f.key !== 'all' && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: f.color }} />}
              {f.label}
              {f.key !== 'all' && filter === f.key && <X size={10} className="ml-0.5" onClick={(e) => { e.stopPropagation(); setFilter('all') }} />}
            </button>
          ))}
        </div>
      </div>

      <div className="p-2">
        <div className="grid grid-cols-7 gap-px mb-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-500 dark:text-gray-400 py-1">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-px">
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const inMonth = isSameMonth(day, currentMonth)
            const isToday = isSameDay(day, today)
            const dots = dayDotsMap[dateStr] || []
            const filteredDots = filter === 'all' ? dots : dots.filter(d => d.type === filter)

            return (
              <button key={dateStr} onClick={() => onSelectDate(day)}
                className={`relative p-1 rounded-lg text-xs transition-all ${!inMonth ? 'opacity-30' : ''} ${isToday ? 'bg-purple-100 dark:bg-purple-900/30 ring-2 ring-purple-400' : 'hover:bg-gray-100 dark:hover:bg-gray-700'} ${filter !== 'all' && filteredDots.length === 0 ? 'opacity-50' : ''}`}>
                <span className={`font-medium block text-center ${isToday ? 'text-purple-700 dark:text-purple-300' : 'text-gray-700 dark:text-gray-300'}`}>
                  {format(day, 'd')}
                </span>
                {filteredDots.length > 0 && (
                  <div className="flex gap-0.5 justify-center mt-0.5 flex-wrap">
                    {filteredDots.slice(0, 4).map((dot, i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot.color }} />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2 text-[10px] text-gray-500">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#3b82f6' }} /> Classes</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ef4444' }} /> Exams</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#f59e0b' }} /> Reminders</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#a855f7' }} /> Holidays</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#6b7280' }} /> Events</span>
      </div>
    </div>
  )
}
