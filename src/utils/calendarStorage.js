import { v4 as uuidv4 } from 'uuid'
import { format, parseISO, isAfter, startOfDay } from 'date-fns'
import { getAllSessions, markAttendance, markHoliday, removeHoliday, getSubjects as getAttSubjects } from './attendanceStorage'
import { getSubjects as getMarksSubjects } from './marksStorage'

const EVENTS_KEY = 'student-os-calendar-events'
const HOLIDAYS_KEY = 'student-os-calendar-holidays'
const REMINDERS_KEY = 'student-os-calendar-reminders'

function getStored(key, def) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : def } catch { return def }
}
function setStored(key, data) { localStorage.setItem(key, JSON.stringify(data)) }

export function getCustomEvents() { return getStored(EVENTS_KEY, []) }
export function saveCustomEvent(data) {
  const events = getCustomEvents()
  if (data.id) { const i = events.findIndex(e => e.id === data.id); if (i >= 0) events[i] = { ...events[i], ...data, updatedAt: new Date().toISOString() } }
  else { data.id = uuidv4(); data.createdAt = new Date().toISOString(); events.push(data) }
  setStored(EVENTS_KEY, events)
  return data
}
export function deleteCustomEvent(id) { setStored(EVENTS_KEY, getCustomEvents().filter(e => e.id !== id)) }

export function getHolidays() { return getStored(HOLIDAYS_KEY, []) }
export function saveHoliday(data) {
  const holidays = getHolidays()
  if (data.id) { const i = holidays.findIndex(h => h.id === data.id); if (i >= 0) holidays[i] = { ...holidays[i], ...data } }
  else { data.id = uuidv4(); data.createdAt = new Date().toISOString(); holidays.push(data) }
  setStored(HOLIDAYS_KEY, holidays)
  return data
}
export function deleteHoliday(id) { setStored(HOLIDAYS_KEY, getHolidays().filter(h => h.id !== id)) }

export function getReminders() { return getStored(REMINDERS_KEY, []) }
export function saveReminder(data) {
  const reminders = getReminders()
  if (data.id) { const i = reminders.findIndex(r => r.id === data.id); if (i >= 0) reminders[i] = { ...reminders[i], ...data } }
  else { data.id = uuidv4(); data.createdAt = new Date().toISOString(); reminders.push(data) }
  setStored(REMINDERS_KEY, reminders)
  return data
}
export function deleteReminder(id) { setStored(REMINDERS_KEY, getReminders().filter(r => r.id !== id)) }

export function getColorForType(type) {
  const map = {
    class: '#3b82f6', exam: '#ef4444', assignment: '#10b981',
    reminder: '#f59e0b', holiday: '#a855f7', custom: '#6b7280',
    study: '#06b6d4', project: '#84cc16', meeting: '#f97316',
    event: '#8b5cf6', deadline: '#ec4899'
  }
  return map[type] || '#6b7280'
}

const PRIORITY = { exam: 0, class: 1, deadline: 2, assignment: 3, reminder: 4, holiday: 5, custom: 6 }

function getPriority(type) { return PRIORITY[type] !== undefined ? PRIORITY[type] : 99 }

export function getAllEventsForDate(dateStr) {
  const today = format(new Date(), 'yyyy-MM-dd')
  const now = new Date()
  const events = []

  const attSubjects = getAttSubjects().filter(s => !s.semesterCompleted)
  const allSessions = getAllSessions()
  attSubjects.forEach(sub => {
    const subSessions = allSessions.filter(s => s.subjectId === sub.id && s.date === dateStr)
    subSessions.forEach(s => {
      const isFuture = s.date > today
      const canMark = s.date <= today && !s.isLocked && !sub.semesterCompleted && s.status !== 'holiday'
      const happening = s.date === today && s.startTime && !isAfter(now, parseISO(`${today}T${s.startTime}`)) === false
      events.push({
        id: `session_${s.id}`, sourceId: s.id, type: 'class',
        title: sub.name, subtitle: `${s.startTime} - ${s.endTime}`,
        date: s.date, startTime: s.startTime, endTime: s.endTime,
        subjectId: sub.id, subjectColor: sub.color || '#3b82f6',
        status: s.isLocked ? 'locked' : s.status === 'holiday' ? 'holiday' : s.status === 'present' ? 'completed' : s.status === 'absent' ? 'missed' : isFuture ? 'upcoming' : 'pending',
        color: getColorForType('class'),
        attendanceStatus: s.status,
        isLocked: s.isLocked,
        canMark, isFuture,
        sessionData: s
      })
    })
  })

  const marksSubjects = getMarksSubjects()
  marksSubjects.forEach(sub => {
    (sub.assessments || []).forEach(a => {
      if (a.date === dateStr) {
        events.push({
          id: `exam_${a.id}`, sourceId: a.id, type: 'exam',
          title: `${a.name} — ${sub.name}`, subtitle: `Max: ${a.maxMarks} | Weightage: ${a.weightage}${sub.weightageMode === 'percentage' ? '%' : ''}`,
          date: a.date, startTime: a.date || '', endTime: '',
          subjectId: sub.id, subjectColor: sub.color || '#ef4444',
          status: a.status === 'cancelled' ? 'cancelled' : a.status === 'completed' ? 'completed' : 'upcoming',
          color: getColorForType('exam'),
          assessmentData: a,
          subjectName: sub.name
        })
      }
    })
  })

  const holidays = getHolidays().filter(h => h.date === dateStr)
  holidays.forEach(h => {
    events.push({
      id: `holiday_${h.id}`, sourceId: h.id, type: 'holiday',
      title: h.title || 'Holiday', subtitle: h.reason || '',
      date: h.date, startTime: '', endTime: '',
      subjectId: null, subjectColor: '#a855f7',
      status: 'holiday', color: getColorForType('holiday'),
      isFullDay: true, holidayData: h
    })
  })

  const customEvents = getCustomEvents().filter(e => e.date === dateStr)
  customEvents.forEach(e => {
    events.push({
      id: `custom_${e.id}`, sourceId: e.id, type: e.eventType || 'custom',
      title: e.title, subtitle: e.description || '',
      date: e.date, startTime: e.startTime || '', endTime: e.endTime || '',
      subjectId: e.subjectId || null, subjectColor: e.color || getColorForType('custom'),
      status: 'upcoming', color: e.color || getColorForType('custom'),
      location: e.location || '', priority: e.priority || 'normal',
      eventData: e
    })
  })

  const reminders = getReminders().filter(r => r.date === dateStr)
  reminders.forEach(r => {
    events.push({
      id: `reminder_${r.id}`, sourceId: r.id, type: 'reminder',
      title: r.title, subtitle: r.priority ? `${r.priority} priority` : '',
      date: r.date, startTime: r.time || '', endTime: '',
      subjectId: null, subjectColor: getColorForType('reminder'),
      status: r.completed ? 'completed' : 'upcoming',
      color: getColorForType('reminder'),
      reminderData: r
    })
  })

  events.sort((a, b) => {
    const pa = getPriority(a.type), pb = getPriority(b.type)
    if (pa !== pb) return pa - pb
    return (a.startTime || '').localeCompare(b.startTime || '')
  })

  return events
}

export function getAllEventsForRange(startDate, endDate) {
  const all = []
  let d = new Date(parseISO(startDate))
  const end = new Date(parseISO(endDate))
  while (d <= end) {
    const dateStr = format(d, 'yyyy-MM-dd')
    const dayEvents = getAllEventsForDate(dateStr)
    dayEvents.forEach(e => all.push(e))
    d.setDate(d.getDate() + 1)
  }
  return all
}

export function getDayDots(dateStr) {
  const events = getAllEventsForDate(dateStr)
  const dots = []
  const seen = new Set()
  events.forEach(e => {
    if (!seen.has(e.type)) { dots.push({ color: e.color, type: e.type }); seen.add(e.type) }
  })
  return dots
}

export function getTodaySummary() {
  const today = format(new Date(), 'yyyy-MM-dd')
  const events = getAllEventsForDate(today)
  return {
    classes: events.filter(e => e.type === 'class'),
    exams: events.filter(e => e.type === 'exam'),
    reminders: events.filter(e => e.type === 'reminder'),
    holidays: events.filter(e => e.type === 'holiday'),
    customs: events.filter(e => e.type === 'custom'),
    pending: events.filter(e => e.type === 'class' && e.status === 'pending')
  }
}

export function getUpcomingDeadlines(days = 7) {
  const today = new Date()
  const deadlines = []
  for (let i = 0; i < days; i++) {
    const d = new Date(today); d.setDate(d.getDate() + i)
    const dateStr = format(d, 'yyyy-MM-dd')
    getAllEventsForDate(dateStr).forEach(e => deadlines.push(e))
  }
  return deadlines.filter(e => e.status === 'upcoming' || e.status === 'pending')
}

export function handleCalendarAttendance(sessionId, status) {
  const result = markAttendance(sessionId, status)
  if (result?.error) return { error: result.error }
  return { success: true }
}

export function handleCalendarHoliday(sessionIds, reason) {
  markHoliday(sessionIds, reason)
  return { success: true }
}

export function handleCalendarRemoveHoliday(sessionId) {
  removeHoliday(sessionId)
  return { success: true }
}
