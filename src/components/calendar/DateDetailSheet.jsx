import React, { useState, useEffect, useMemo } from 'react'
import { format } from 'date-fns'
import { X, CheckCircle2, XCircle, Clock, Ban, GraduationCap, BookOpen, Bell, AlertTriangle, Trash2, CalendarDays } from 'lucide-react'
import { getAllEventsForDate, handleCalendarAttendance, handleCalendarHoliday, handleCalendarRemoveHoliday, getColorForType, deleteCustomEvent, deleteHoliday, deleteReminder, saveReminder } from '../../utils/calendarStorage'

export default function DateDetailSheet({ selectedDate, onClose, onRefresh }) {
  const [toast, setToast] = useState(null)
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''
  const isToday = selectedDate ? format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd') : false

  const events = useMemo(() => selectedDate ? getAllEventsForDate(dateStr) : [], [selectedDate, dateStr])

  const [refreshKey, setRefreshKey] = useState(0)
  useEffect(() => { setRefreshKey(k => k + 1) }, [dateStr])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const handleMark = (sessionId, status) => {
    const result = handleCalendarAttendance(sessionId, status)
    if (result?.error) showToast(result.error, 'error')
    else { showToast(`Marked ${status}`); onRefresh?.() }
  }

  const handleHoliday = (sessionId) => {
    const reason = prompt('Reason:') || 'Holiday'
    handleCalendarHoliday([sessionId], reason)
    showToast('Marked holiday')
    onRefresh?.()
  }

  const handleRemoveHoliday = (sessionId) => {
    handleCalendarRemoveHoliday(sessionId)
    showToast('Holiday removed')
    onRefresh?.()
  }

  const handleDeleteEvent = (e) => {
    if (!window.confirm('Delete this event?')) return
    if (e.sourceId) {
      if (e.type === 'holiday') deleteHoliday(e.sourceId)
      else if (e.type === 'reminder') deleteReminder(e.sourceId)
      else deleteCustomEvent(e.sourceId)
    }
    showToast('Deleted')
    onRefresh?.()
  }

  const handleCompleteReminder = (reminderData) => {
    if (!reminderData) return
    saveReminder({ ...reminderData, completed: !reminderData.completed })
    showToast(reminderData.completed ? 'Marked incomplete' : 'Completed!')
    onRefresh?.()
  }

  const grouped = useMemo(() => {
    const g = { exam: [], class: [], deadline: [], assignment: [], reminder: [], holiday: [], custom: [] }
    events.forEach(e => {
      if (g[e.type]) g[e.type].push(e)
      else g.custom.push(e)
    })
    return g
  }, [events])

  const sections = [
    { key: 'exam', label: 'Exams', icon: GraduationCap, color: '#ef4444', events: grouped.exam },
    { key: 'class', label: 'Classes', icon: BookOpen, color: '#3b82f6', events: grouped.class },
    { key: 'assignment', label: 'Assignments', icon: CheckCircle2, color: '#10b981', events: grouped.assignment },
    { key: 'deadline', label: 'Deadlines', icon: AlertTriangle, color: '#ec4899', events: grouped.deadline },
    { key: 'reminder', label: 'Reminders', icon: Bell, color: '#f59e0b', events: grouped.reminder },
    { key: 'holiday', label: 'Holidays', icon: Ban, color: '#a855f7', events: grouped.holiday },
    { key: 'custom', label: 'Events', icon: Clock, color: '#6b7280', events: grouped.custom }
  ]

  const hasEvents = events.length > 0

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) onClose?.() }}>
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              {isToday ? 'Today' : format(selectedDate || new Date(), 'EEEE, MMMM d')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">{dateStr}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={20} /></button>
        </div>

        {toast && (
          <div className={`mx-4 mt-2 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs ${toast.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 text-red-600' : 'bg-green-50 dark:bg-green-900/20 border border-green-200 text-green-600'}`}>
            {toast.type === 'error' ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />} {toast.msg}
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!hasEvents && (
            <div className="text-center py-10 text-gray-400 text-sm">
              <CalendarDays size={32} className="mx-auto mb-2 opacity-50" />
              No events for this date.
            </div>
          )}

          {sections.map(section => {
            if (section.events.length === 0) return null
            return (
              <div key={section.key}>
                <div className="flex items-center gap-1.5 mb-2">
                  <section.icon size={14} style={{ color: section.color }} />
                  <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{section.label}</span>
                  <span className="text-[10px] text-gray-400">({section.events.length})</span>
                </div>
                <div className="space-y-1">
                  {section.events.map(event => (
                    <div key={event.id} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                      <span className="w-1 h-8 rounded-full shrink-0" style={{ backgroundColor: event.color || section.color }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{event.title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-gray-500">
                          {event.startTime && <span>{event.startTime}{event.endTime ? ` - ${event.endTime}` : ''}</span>}
                          {event.subtitle && <span className="truncate">{event.subtitle}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {(event.type === 'class' && event.canMark) && (
                          <>
                            <button onClick={() => handleMark(event.sourceId, 'present')} className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-500 transition-colors" title="Present">
                              <CheckCircle2 size={14} />
                            </button>
                            <button onClick={() => handleMark(event.sourceId, 'absent')} className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-400 transition-colors" title="Absent">
                              <XCircle size={14} />
                            </button>
                            <button onClick={() => handleHoliday(event.sourceId)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 transition-colors" title="Holiday">
                              <Ban size={14} />
                            </button>
                          </>
                        )}
                        {(event.type === 'class' && event.status === 'holiday' && !event.isLocked) && (
                          <button onClick={() => handleRemoveHoliday(event.sourceId)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors" title="Remove Holiday">
                            <Trash2 size={12} />
                          </button>
                        )}
                        {(event.type === 'class' && event.status === 'upcoming') && (
                          <span className="flex items-center gap-1 text-blue-500 text-[10px]"><Clock size={10} /> Upcoming</span>
                        )}
                        {(event.type === 'class' && event.isLocked) && (
                          <span className="text-gray-400 text-[10px] flex items-center gap-1"><Ban size={10} /> Locked</span>
                        )}

                        {event.type === 'exam' && event.assessmentData && (
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${event.status === 'upcoming' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600' : event.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                            {event.status}
                          </span>
                        )}

                        {event.type === 'reminder' && (
                          <button onClick={() => handleCompleteReminder(event.reminderData)}
                            className={`p-1 rounded transition-colors ${event.reminderData?.completed ? 'text-green-500' : 'text-gray-400 hover:text-green-500'}`}>
                            <CheckCircle2 size={14} />
                          </button>
                        )}

                        {(event.type === 'custom' || event.type === 'holiday') && (
                          <button onClick={() => handleDeleteEvent(event)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>

                      {(event.type === 'class' && !event.canMark && event.status !== 'upcoming' && !event.isLocked && event.status !== 'holiday') && (
                        <span className="text-[10px] font-medium text-gray-500 ml-auto">{event.status === 'completed' ? 'Present' : event.status === 'missed' ? 'Absent' : event.status}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
