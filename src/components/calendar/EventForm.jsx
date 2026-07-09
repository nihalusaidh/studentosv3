import React, { useState } from 'react'
import { X, Plus, Bell, Ban } from 'lucide-react'
import { format } from 'date-fns'
import { saveCustomEvent, saveHoliday, saveReminder, getColorForType } from '../../utils/calendarStorage'
import { getSubjects as getAttSubjects } from '../../utils/attendanceStorage'

const EVENT_TYPES = [
  { id: 'study', label: 'Study Session', color: '#06b6d4' },
  { id: 'assignment', label: 'Assignment', color: '#10b981' },
  { id: 'project', label: 'Project Work', color: '#84cc16' },
  { id: 'meeting', label: 'Meeting', color: '#f97316' },
  { id: 'club', label: 'Club Activity', color: '#ec4899' },
  { id: 'sports', label: 'Sports', color: '#f59e0b' },
  { id: 'event', label: 'College Event', color: '#8b5cf6' },
  { id: 'other', label: 'Other', color: '#6b7280' }
]

const PRIORITIES = ['low', 'normal', 'high']

export default function EventForm({ selectedDate, onClose, onRefresh }) {
  const [tab, setTab] = useState('event')
  const dateStr = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')

  const [title, setTitle] = useState('')
  const [eventType, setEventType] = useState('study')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [priority, setPriority] = useState('normal')
  const [color, setColor] = useState('#06b6d4')

  const [reminderTitle, setReminderTitle] = useState('')
  const [reminderTime, setReminderTime] = useState('')
  const [reminderPriority, setReminderPriority] = useState('normal')
  const [reminderDate, setReminderDate] = useState(dateStr)

  const [holidayTitle, setHolidayTitle] = useState('')
  const [holidayReason, setHolidayReason] = useState('')
  const [holidayDate, setHolidayDate] = useState(dateStr)
  const [holidayFullDay, setHolidayFullDay] = useState(true)

  const attSubjects = getAttSubjects().filter(s => !s.semesterCompleted)

  const handleAddEvent = () => {
    if (!title.trim()) return
    saveCustomEvent({ title: title.trim(), eventType, date: dateStr, startTime, endTime, description, location, priority, color })
    reset(); onRefresh?.()
  }

  const handleAddReminder = () => {
    if (!reminderTitle.trim()) return
    saveReminder({ title: reminderTitle.trim(), date: reminderDate, time: reminderTime, priority: reminderPriority, completed: false })
    reset(); onRefresh?.()
  }

  const handleAddHoliday = () => {
    if (!holidayTitle.trim()) return
    saveHoliday({ title: holidayTitle.trim(), reason: holidayReason, date: holidayDate, isFullDay: holidayFullDay })
    reset(); onRefresh?.()
  }

  const reset = () => {
    setTitle(''); setStartTime(''); setEndTime(''); setDescription(''); setLocation(''); setPriority('normal'); setColor('#06b6d4')
    setReminderTitle(''); setReminderTime(''); setReminderPriority('normal')
    setHolidayTitle(''); setHolidayReason('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={(e) => { if (e.target === e.currentTarget) { reset(); onClose?.() } }}>
      <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-2xl shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between shrink-0">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Add to Calendar</h2>
          <button onClick={() => { reset(); onClose?.() }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><X size={20} /></button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-gray-700 shrink-0">
          {[
            { key: 'event', label: 'Event', icon: Plus },
            { key: 'reminder', label: 'Reminder', icon: Bell },
            { key: 'holiday', label: 'Holiday', icon: Ban }
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all ${tab === t.key ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'event' && (
            <div className="space-y-3">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Event title *" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              <p className="text-xs text-gray-400 -mt-1">Date: {dateStr}</p>
              <div className="grid grid-cols-2 gap-3">
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Start" />
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" placeholder="End" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {EVENT_TYPES.map(t => (
                    <button key={t.id} onClick={() => { setEventType(t.id); setColor(t.color) }} className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border ${eventType === t.id ? 'border-current ring-2 ring-current' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`} style={eventType === t.id ? { color: t.color, backgroundColor: `${t.color}15` } : {}}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Location (optional)" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <div className="flex gap-2">
                  {PRIORITIES.map(p => (
                    <button key={p} onClick={() => setPriority(p)} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${priority === p ? 'bg-purple-100 dark:bg-purple-900/40 border-purple-300 text-purple-700 dark:text-purple-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddEvent} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-semibold hover:from-purple-700 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/25">Add Event</button>
            </div>
          )}

          {tab === 'reminder' && (
            <div className="space-y-3">
              <input value={reminderTitle} onChange={e => setReminderTitle(e.target.value)} placeholder="Reminder title *" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <input type="date" value={reminderDate} onChange={e => setReminderDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Time</p>
                  <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Priority</p>
                <div className="flex gap-2">
                  {['low', 'normal', 'high'].map(p => (
                    <button key={p} onClick={() => setReminderPriority(p)} className={`flex-1 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${reminderPriority === p ? 'bg-orange-100 dark:bg-orange-900/40 border-orange-300 text-orange-700 dark:text-orange-300' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <button onClick={handleAddReminder} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 text-white text-sm font-semibold hover:from-orange-600 hover:to-yellow-600 transition-all shadow-lg shadow-orange-500/25">Add Reminder</button>
            </div>
          )}

          {tab === 'holiday' && (
            <div className="space-y-3">
              <input value={holidayTitle} onChange={e => setHolidayTitle(e.target.value)} placeholder="Holiday title *" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Date</p>
                  <input type="date" value={holidayDate} onChange={e => setHolidayDate(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
                </div>
                <div className="flex items-end">
                  <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm cursor-pointer">
                    <input type="checkbox" checked={holidayFullDay} onChange={e => setHolidayFullDay(e.target.checked)} className="rounded" />
                    <span className="text-xs text-gray-700 dark:text-gray-300">Full day</span>
                  </label>
                </div>
              </div>
              <input value={holidayReason} onChange={e => setHolidayReason(e.target.value)} placeholder="Reason (optional)" className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-purple-500 outline-none" />
              <button onClick={handleAddHoliday} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 text-white text-sm font-semibold hover:from-purple-600 hover:to-pink-500 transition-all shadow-lg shadow-purple-500/25">Add Holiday</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
